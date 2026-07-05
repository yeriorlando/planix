import { getCurrentUser, saveUsuario, Usuario } from "./storage";
import { requestD1 } from "./services/d1Client";

export interface CreditCosts {
  grades_report: number;      // Entrar al reporte de evaluación en calificaciones
  attendance_summary: number; // Entrar al resumen anual en asistencia
  ai_planning: number;        // Generación con IA en planificación
  rubric_generation: number;  // Generar rúbrica o lista de cotejo
  planix_chat: number;        // Mensaje en Planix Chat
  save_planning: number;      // Guardar planificación
  exam_generator: number;     // Generar examen con IA
  wordsearch_generator: number; // Generar sopa de letras con IA
  crossword_generator: number;  // Generar crucigrama con IA
  jeopardy_generator: number;   // Generar tablero Jeopardy con IA
  bajo_la_lluvia: number;       // Generar dinámica Bajo la Lluvia con IA
  mentira_generator: number;    // Generar dinámica Dos Verdades y una Mentira con IA
  rimando_ando: number;         // Generar dinámica Rimando Ando con IA
}

export const DEFAULT_CREDIT_COSTS: CreditCosts = {
  grades_report: 10,
  attendance_summary: 5,
  ai_planning: 15,
  rubric_generation: 20,
  planix_chat: 2,
  save_planning: 15,
  exam_generator: 20,
  wordsearch_generator: 15,
  crossword_generator: 15,
  jeopardy_generator: 15,
  bajo_la_lluvia: 15,
  mentira_generator: 15,
  rimando_ando: 15,
};

const COSTS_KEY = "plx:credit_costs";

export function getCreditCosts(): CreditCosts {
  if (typeof window === "undefined") return DEFAULT_CREDIT_COSTS;
  try {
    const stored = localStorage.getItem(COSTS_KEY);
    if (!stored) return DEFAULT_CREDIT_COSTS;
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_CREDIT_COSTS,
      ...parsed
    };
  } catch {
    return DEFAULT_CREDIT_COSTS;
  }
}

export function saveCreditCosts(costs: CreditCosts) {
  if (typeof window !== "undefined") {
    localStorage.setItem(COSTS_KEY, JSON.stringify(costs));
  }
}

/**
 * Returns the current user's credits.
 * For free users, defaults to 100 if undefined.
 */
export function getUserCredits(user: Usuario | null): number {
  if (!user) return 0;
  if (user.rol === "admin" || user.suscripcion === "pro") return Infinity;
  // If creditos is not defined, seed it with 100
  if ((user as any).creditos === undefined) {
    (user as any).creditos = 100;
    saveUsuario(user);
  }
  return (user as any).creditos;
}

/**
 * Checks if the user has enough credits for a specific action without consuming them.
 */
export function hasEnoughCredits(actionKey: keyof CreditCosts): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.rol === "admin" || user.suscripcion === "pro") return true;

  const costs = getCreditCosts();
  const cost = costs[actionKey] ?? 0;
  const currentCredits = getUserCredits(user);

  return currentCredits >= cost;
}

/**
 * Checks and consumes credits for a specific action.
 * Returns true if allowed (either because user is PRO or had enough credits), false otherwise.
 */
export function consumeCredits(actionKey: keyof CreditCosts): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  // Pro users or Admin have unlimited access
  if (user.rol === "admin" || user.suscripcion === "pro") {
    return true;
  }

  const costs = getCreditCosts();
  const cost = costs[actionKey] ?? 0;
  const currentCredits = getUserCredits(user);

  if (currentCredits < cost) {
    return false;
  }

  // Deduct credits
  const updatedUser = {
    ...user,
    creditos: currentCredits - cost,
  };
  saveUsuario(updatedUser as any);
  
  // Refresh active user in localStorage session
  if (typeof window !== "undefined") {
    localStorage.setItem("plx:user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("plx:user_changed"));
  }

  // Sync updated credits value to D1 database in the background
  requestD1("/api/profiles", "POST", {
    id: updatedUser.id,
    full_name: updatedUser.nombre,
    email: updatedUser.email,
    role: updatedUser.rol,
    subscription_tier: updatedUser.suscripcion,
    subscription_status: updatedUser.estado_suscripcion,
    subscription_expiry: updatedUser.suscripcion_hasta,
    school_name: updatedUser.colegio,
    nivel_principal: updatedUser.nivel,
    ciclo_principal: updatedUser.ciclo,
    grado_principal: updatedUser.grado,
    allowed_subjects: updatedUser.allowed_subjects,
    avatar_url: updatedUser.avatar_url,
    credits: updatedUser.creditos
  }).catch((err) => {
    console.error("Error syncing credits consumption to D1:", err);
  });

  return true;
}

/**
 * Returns the cost and current credits for a given action key.
 * Useful for populating the ModalCreditos.
 */
export function getCreditInfo(actionKey: keyof CreditCosts): { cost: number; currentCredits: number } {
  const user = getCurrentUser();
  const costs = getCreditCosts();
  const cost = costs[actionKey] ?? 0;
  const currentCredits = getUserCredits(user);
  return { cost, currentCredits };
}

/**
 * Adds credits to a specific user.
 */
export async function addCreditsToUser(userId: string, amount: number): Promise<boolean> {
  const localStorageUsers = localStorage.getItem("plx:users");
  if (!localStorageUsers) return false;

  try {
    const allUsers: Usuario[] = JSON.parse(localStorageUsers);
    const userIdx = allUsers.findIndex(u => u.id === userId);
    if (userIdx === -1) return false;

    const user = allUsers[userIdx];
    const current = (user as any).creditos ?? 100;
    const newCredits = Math.max(0, current + amount);
    (user as any).creditos = newCredits;
    
    allUsers[userIdx] = user;
    localStorage.setItem("plx:users", JSON.stringify(allUsers));

    // Also update current active session if it's the logged-in user
    const session = localStorage.getItem("plx:session");
    if (session) {
      const parsedSession = JSON.parse(session);
      if (parsedSession.user_id === userId) {
        localStorage.setItem("plx:user", JSON.stringify(user));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("plx:user_changed"));
        }
      }
    }

    // Sync manual credit adjustment to D1 database — AWAIT so data is persisted before any refresh
    try {
      await requestD1("/api/profiles", "POST", {
        id: user.id,
        full_name: user.nombre,
        email: user.email,
        role: user.rol,
        subscription_tier: user.suscripcion,
        subscription_status: user.estado_suscripcion,
        subscription_expiry: user.suscripcion_hasta,
        school_name: user.colegio,
        nivel_principal: user.nivel,
        ciclo_principal: user.ciclo,
        grado_principal: user.grado,
        allowed_subjects: user.allowed_subjects,
        avatar_url: user.avatar_url,
        credits: newCredits
      });
    } catch (err) {
      console.error("Error syncing manual credit adjustment to D1:", err);
    }

    return true;
  } catch (err) {
    console.error("Error adding credits:", err);
    return false;
  }
}
