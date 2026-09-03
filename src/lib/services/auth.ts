import { supabase } from "../supabase";
import { saveUsuario, getUsers, type Usuario, type RolUsuario, type PlanId } from "../storage";
import { requestD1 } from "./d1Client";

export interface MappedProfile extends Usuario {}

export async function signIn(email: string, password?: string) {
  if (!password) {
    throw new Error("La contraseña es requerida.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (!data.session) throw new Error("No se pudo iniciar sesión.");

  // Update last_login timestamp asynchronously
  const nowIso = new Date().toISOString();
  requestD1("/api/profiles", "POST", { id: data.session.user.id, last_login: nowIso }).catch(() => {});
  supabase.from('profiles').update({ last_login: nowIso }).eq('id', data.session.user.id).then(() => {}).catch(() => {});

  // Try fetching the latest profile from D1 first to ensure up-to-date data (e.g. correct name in welcome toast)
  try {
    const profile = await fetchProfile(data.session.user.id);
    if (profile) {
      profile.last_login = nowIso;
      return { session: data.session, profile };
    }
  } catch (err) {
    console.warn("Blocking profile fetch failed during login:", err);
  }

  // Check if profile exists locally as a fallback
  const localUsers = getUsers();
  const localProfile = localUsers.find(
    (u) => u.id === data.session.user.id || u.email.toLowerCase() === email.toLowerCase()
  );

  if (localProfile) {
    return { session: data.session, profile: localProfile };
  }

  throw new Error("No se pudo obtener el perfil de usuario de la base de datos.");
}

export async function signUp(
  nombre: string,
  email: string,
  rol: RolUsuario = "teacher",
  plan: PlanId = "free",
  colegio?: string,
  password?: string,
  nivel?: "inicial" | "primaria" | "secundaria",
  ciclo?: string,
  grado?: string,
  allowed_subjects?: Record<string, string[]>,
  regional?: string,
  distrito?: string,
  municipio?: string,
  referred_by_code?: string
) {
  if (!password) {
    throw new Error("La contraseña es requerida.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nombre,
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("No se pudo crear el usuario.");

  const profileData: any = {
    id: data.user.id,
    full_name: nombre,
    email,
    role: rol === "admin" ? "ADMINISTRADOR" : rol,
    subscription_tier: plan,
    subscription_status: "ACTIVO",
    subscription_expiry: plan === "pro" ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
    school_name: colegio || null,
    nivel_principal: nivel || null,
    ciclo_principal: ciclo || null,
    grado_principal: grado || null,
    allowed_subjects: allowed_subjects || null,
    last_login: new Date().toISOString(),
    is_active: true,
    regional: regional || null,
    distrito: distrito || null,
    municipio: municipio || null,
    referred_by_code: referred_by_code || null,
  };

  try {
    const res = await requestD1<any>("/api/profiles", "POST", profileData);
    if (res && res.credits !== undefined) {
      profileData.credits = res.credits;
    }
  } catch (insertError) {
    console.error("Error inserting profile to D1:", insertError);
  }

  const profile = mapProfile(profileData);
  saveUsuario(profile);
  return { user: data.user, profile };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<MappedProfile | null> {
  try {
    const data = await requestD1<any>(`/api/profiles/${userId}`);
    if (!data) return null;
    const profile = mapProfile(data);
    saveUsuario(profile);
    return profile;
  } catch (err) {
    console.error("Error fetching profile from D1:", err);
    return null;
  }
}


export function mapProfile(profile: any): MappedProfile {
  const emailLower = (profile.email || "").toLowerCase().trim();
  const isDocenteAdmin =
    profile.role === "ADMINISTRADOR" ||
    profile.role === "ADMINISTRADOR_CURRICULO" ||
    emailLower === "admin@planix.do" ||
    emailLower === "reyna.mancebo@docente.edu.do";

  const getMappedRole = (): RolUsuario => {
    if (isDocenteAdmin) return "admin";
    const dbRole = (profile.role || "").toLowerCase();
    if (dbRole === "admin" || dbRole === "administrador") return "admin";
    if (dbRole === "coordinator" || dbRole === "coordinador") return "coordinator";
    if (dbRole === "director") return "director";
    return "teacher";
  };

  return {
    id: profile.id,
    nombre: profile.full_name || "",
    email: profile.email || "",
    rol: getMappedRole(),
    suscripcion: isDocenteAdmin ? "pro" : ((profile.subscription_tier?.toLowerCase() as PlanId) || "free"),
    estado_suscripcion: (() => {
      const status = (profile.subscription_status || profile.estado_suscripcion || 'ACTIVO').toUpperCase();
      if (status === 'ACTIVE' || status === 'ACTIVO') return 'ACTIVO';
      if (status === 'SUSPENDIDO' || status === 'SUSPENDED') return 'SUSPENDIDO';
      if (status === 'EXPIRADO' || status === 'EXPIRED') return 'EXPIRADO';
      return 'ACTIVO';
    })() as any,
    suscripcion_hasta:
      profile.subscription_expiry ||
      new Date(Date.now() + 30 * 86400000).toISOString(),
    colegio: profile.school_name || undefined,
    nivel: (profile.nivel_principal as any) || undefined,
    ciclo: profile.ciclo_principal || undefined,
    grado: profile.grado_principal || undefined,
    allowed_subjects: (profile.allowed_subjects as any) || undefined,
    creado_en: profile.created_at || new Date().toISOString(),
    regional: profile.regional || undefined,
    distrito: profile.distrito || undefined,
    municipio: profile.municipio || undefined,
    avatar_url: profile.avatar_url || profile.image || undefined,
    creditos: profile.credits !== null && profile.credits !== undefined ? Number(profile.credits) : 100,
    referral_code: profile.referral_code || undefined,
    referred_by: profile.referred_by || undefined,
    year_escolar_activo: profile.year_escolar_activo || undefined,
    preferences: profile.preferences || undefined,
    is_ambassador: profile.is_ambassador === 1 || profile.is_ambassador === true,
    last_login: profile.last_login || undefined,
  };
}
