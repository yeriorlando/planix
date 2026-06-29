// Planix 2.0 — Persistencia local simulada (multi-app con RLS)
import * as classroomsService from "./services/classrooms";
import * as studentsService from "./services/students";
import * as attendanceService from "./services/attendance";
import * as rubricsService from "./services/rubrics";
import * as evaluationsService from "./services/evaluations";
import * as gradesService from "./services/grades";
import * as incidentsService from "./services/incidents";
import { savePlanning, deletePlanning } from "./services/plannings";


export type PlanId = "free" | "pro";

export interface Plan {
  id: PlanId;
  nombre: string;
  precio_mensual: number;
  limite_aulas: number;
  limite_planificaciones: number | null;
  modulos: {
    ia_avanzada: boolean;
    canvas_pro: boolean;
    comunidad: boolean;
    boletines_pdf: boolean;
    asistencia_anual: boolean;
    bienestar_docente: boolean;
  };
  destacado?: boolean;
}

export type RolUsuario = "teacher" | "admin" | "coordinator" | "director";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: RolUsuario;
  suscripcion: PlanId;
  estado_suscripcion: "ACTIVO" | "EXPIRADO" | "SUSPENDIDO";
  suscripcion_hasta: string;
  colegio?: string;
  nivel?: "inicial" | "primaria" | "secundaria";
  ciclo?: string;
  grado?: string;
  regional?: string;
  distrito?: string;
  municipio?: string;
  allowed_subjects?: Record<string, string[]>;
  creado_en: string;
  avatar_url?: string;
  metodo_acceso?: "google" | "correo";
  fingerprint?: string;
  creditos?: number;
  last_login?: string;
  updated_at?: string;
  referral_code?: string;
  referred_by?: string;
  year_escolar_activo?: string;
  preferences?: any;
  is_ambassador?: boolean;
}

export interface Classroom {
  id: string;
  docente_id: string;
  nombre: string;
  nivel: "inicial" | "primaria" | "secundaria";
  grado: string;
  seccion: string;
  periodo: string; // ej: 2025-2026
  creado_en: string;
}

export interface Student {
  id: string;
  classroom_id: string;
  nombre: string;
  apellido?: string;
  rne_matricula?: string;
  direccion?: string;
  numero_orden: number;
  email_tutor?: string;
  telefono_tutor?: string;
  email_tutor_2?: string;
  telefono_tutor_2?: string;
  tutor_relacion?: string;
  tutor_nombre?: string;
  tutor_telefono?: string;
  tutor2_relacion?: string;
  tutor2_nombre?: string;
  tutor2_telefono?: string;
  genero: "M" | "F";
  avatar_url?: string;
  creado_en: string;
}

export interface Attendance {
  id: string;
  classroom_id: string;
  fecha: string; // YYYY-MM-DD
  registro: Record<string, "P" | "A" | "T" | "E">; // studentId -> Presente, Ausente, Tarde, Excusa
  tipo_dia?: "regular" | "feriado" | "grupo_pedagogico";
}

export interface AnecdotalRecord {
  id: string;
  classroom_id: string;
  student_id: string;
  docente_id: string;
  fecha: string;
  hecho: string;
  sugerencia_ia?: string;
  estado: "borrador" | "guardado";
  creado_en: string;
}

export interface Incidence {
  id: string;
  student_id: string;
  fecha: string;
  descripcion: string;
  gravedad: "leve" | "moderada" | "grave";
  medidas_tomadas: string;
}

export interface Criteria {
  nombre: string;
  peso: number; // porcentaje (ej: 25)
  descripcion?: string; // Observaciones o indicador de verificación para Checklist
  niveles: { nombre: string; puntos: number; description?: string }[];
}

export interface Rubric {
  id: string;
  docente_id: string;
  titulo: string;
  descripcion: string;
  criterios: Criteria[];
  tipo?: "RUBRIC" | "CHECKLIST";
  creado_en: string;
}

export interface StudentEvaluation {
  id: string;
  rubric_id: string;
  student_id: string;
  evaluaciones: Record<string, number>; // nombre_criterio -> puntos_seleccionados
  nota_calculada: number;
  retroalimentacion: string;
  fecha: string;
  resultado?: string;
  puntaje_obtenido?: number;
}

export interface LessonPlan {
  id: string;
  docente_id: string;
  titulo: string;
  tipo: "CON_BASE" | "CURRICULAR";
  nivel: "inicial" | "primaria" | "secundaria";
  grado: string;
  asignatura: string;
  secuencia_id?: string;
  bloque_id?: string;
  actividad_id?: string;
  intencion_pedagogica: string;
  recursos: string[];
  momentos: {
    inicio: string;
    desarrollo: string;
    cierre: string;
  };
  tarea?: string;
  conceptual?: string;
  procedimental?: string;
  actitudinal?: string;
  evaluacion?: string;
  creado_en: string;
  customFields?: Record<string, any>;
  customFormSchema?: any;
}

export interface CommunityPost {
  id: string;
  docente_id: string;
  docente_nombre: string;
  docente_rol: string;
  contenido: string;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  views_count: number;
  liked_by: string[]; // ids de docentes
  bookmarked_by: string[]; // ids de docentes
  creado_en: string;
  comments_disabled?: boolean;
  comentarios: {
    id: string;
    docente_nombre: string;
    contenido: string;
    creado_en: string;
    respuestas?: {
      id: string;
      docente_nombre: string;
      contenido: string;
      creado_en: string;
    }[];
  }[];
}

export interface Guide {
  id: string;
  titulo: string;
  contenido: string; // Markdown supported
  tipo: "GUIA" | "BLOG";
  categoria: string;
  slug: string;
  imagen_url?: string;
  creado_en: string;
}

export interface Ephemeris {
  id: string;
  titulo: string;
  fecha: string; // MM-DD
  descripcion: string;
  nivel?: string;
  category?: string;
  is_holiday?: boolean;
}

export interface SiteConfig {
  welcome_email_content: string;
  ai_model: string;
  sound_active: boolean;
  online_users_count: number;
}

export interface Notification {
  id: string;
  docente_id: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  creado_en: string;
}

export interface OfficialGradeRecord {
  student_id: string;
  classroom_id: string;
  subject_id: string;
  competency_id: string;
  p1?: number | null;
  rp1?: number | null;
  p2?: number | null;
  rp2?: number | null;
  p3?: number | null;
  rp3?: number | null;
  p4?: number | null;
  rp4?: number | null;
  rpf?: number | null;
  rpe?: number | null;
  competency_average?: number | null;
  academic_year: string;
}

const KEY = {
  users: "plx:users",
  classrooms: "plx:classrooms",
  students: "plx:students",
  attendance: "plx:attendance",
  anecdotal: "plx:anecdotal",
  incidences: "plx:incidences",
  rubrics: "plx:rubrics",
  evaluations: "plx:evaluations",
  lesson_plans: "plx:lesson_plans",
  community: "plx:community",
  guides: "plx:guides",
  ephemerides: "plx:ephemerides",
  notifications: "plx:notifications",
  active_user: "plx:activeUser",
  session: "plx:session",
  config: "plx:config",
  official_grades: "plx:official_grades",
};

export const PLANS: Plan[] = [
  {
    id: "free",
    nombre: "Plan Gratuito",
    precio_mensual: 0,
    limite_aulas: 2,
    limite_planificaciones: 10,
    modulos: {
      ia_avanzada: false,
      canvas_pro: false,
      comunidad: true,
      boletines_pdf: false,
      asistencia_anual: false,
      bienestar_docente: false,
    },
  },
  {
    id: "pro",
    nombre: "Plan Docente Pro (Polar.sh)",
    precio_mensual: 490,
    limite_aulas: 99,
    limite_planificaciones: null,
    modulos: {
      ia_avanzada: true,
      canvas_pro: true,
      comunidad: true,
      boletines_pdf: true,
      asistencia_anual: true,
      bienestar_docente: true,
    },
    destacado: true,
  },
];

export const DEFAULT_CONFIG: SiteConfig = {
  welcome_email_content: "¡Bienvenido a Planix! Tu asistente SaaS educativo definitivo.",
  ai_model: "gpt-4o",
  sound_active: true,
  online_users_count: 42,
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(k: string, f: T): T {
  if (!isBrowser()) return f;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : f;
  } catch {
    return f;
  }
}

function write<T>(k: string, v: T) {
  if (isBrowser()) localStorage.setItem(k, JSON.stringify(v));
}

export function playNotificationSound() {
  if (!isBrowser()) return;
  const config = getSiteConfig();
  if (!config.sound_active) return;
  try {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
    audio.volume = 0.4;
    audio.play();
  } catch (e) {
    console.log("No se pudo reproducir el sonido de notificación", e);
  }
}

// ============ Site Config ============
export function getSiteConfig(): SiteConfig {
  return read<SiteConfig>(KEY.config, DEFAULT_CONFIG);
}
export function saveSiteConfig(c: SiteConfig) {
  write(KEY.config, c);
}

function cleanUserList(users: Usuario[]): Usuario[] {
  return users.filter((u) => {
    const email = (u.email || "").toLowerCase().trim();
    const nombre = (u.nombre || "").toLowerCase().trim();
    const normalizedNombre = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Exclude mock emails
    if (email === "docente@planix.do") return false;
    if (email === "testdocente@planix.do") return false;
    if (email === "test_teacher_lbgi44x@example.com") return false;
    if (email === "alberto.ramirez.planix.test@gmail.com") return false;
    
    // Exclude mock names (case & accent insensitive)
    if (normalizedNombre.includes("minerva mirabal")) return false;
    if (normalizedNombre.includes("alejandro perez")) return false;
    if (normalizedNombre.includes("test teacher")) return false;
    if (normalizedNombre.includes("test docente")) return false;
    if (normalizedNombre === "juan perez" && email.includes("test")) return false;
    
    // If email is admin@planix.do, only keep it if the name is Yeri Orlando
    if (email === "admin@planix.do" && !normalizedNombre.includes("yeri orlando")) return false;
    
    return true;
  });
}

// ============ Users & Session ============
export function getUsers(): Usuario[] {
  const all = read<Usuario[]>(KEY.users, []);
  const cleaned = cleanUserList(all);
  if (cleaned.length !== all.length) {
    write(KEY.users, cleaned);
  }
  return cleaned;
}
export function saveUsuario(u: Usuario) {
  const all = getUsers();
  const i = all.findIndex((x) => x.id === u.id);
  if (i >= 0) all[i] = u;
  else all.push(u);
  write(KEY.users, cleanUserList(all));
  
  if (isBrowser()) {
    const session = getSession();
    if (session && session.user_id === u.id) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.suscripcion === 'free' && u.suscripcion === 'pro') {
        localStorage.setItem(`planix_just_promoted_${u.id}`, 'true');
      }
      localStorage.setItem("plx:user", JSON.stringify(u));
    }
    window.dispatchEvent(new Event("plx:user_changed"));
  }
}
export function saveUsuariosBatch(usersList: Usuario[]) {
  // Overwrite local storage directly with the D1 profiles list and filter out mock users
  const cleaned = cleanUserList(usersList);
  write(KEY.users, cleaned);
}
export function deleteUsuario(userId: string) {
  const all = getUsers();
  const filtered = all.filter((u) => u.id !== userId);
  write(KEY.users, filtered);
}
export function getSession(): { user_id: string; iniciado_en: string } | null {
  return read<{ user_id: string; iniciado_en: string } | null>(KEY.session, null);
}
export function setSession(s: { user_id: string; iniciado_en: string } | null) {
  if (s) {
    write(KEY.session, s);
    const user = getUsers().find((u) => u.id === s.user_id);
    if (user) {
      if (isBrowser()) localStorage.setItem("plx:user", JSON.stringify(user));
    }
  } else if (isBrowser()) {
    localStorage.removeItem(KEY.session);
    localStorage.removeItem("plx:user");
  }
}

export function getCurrentUser(): Usuario | null {
  const s = getSession();
  if (!s) return null;
  const user = getUsers().find((u) => u.id === s.user_id) || null;
  if (user) {
    if (user.email.toLowerCase() === "admin@planix.do") {
      user.rol = "admin";
    }
    if (user.rol === "admin") {
      user.suscripcion = "pro";
    }
  }
  return user;
}

export function login(email: string, password?: string): { ok: boolean; error?: string; user?: Usuario } {
  const all = getUsers();
  const user = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { ok: false, error: "Docente no registrado. Por favor, crea tu cuenta." };
  }
  if (user.password && password && user.password !== password) {
    return { ok: false, error: "Contraseña incorrecta." };
  }
  setSession({ user_id: user.id, iniciado_en: new Date().toISOString() });
  return { ok: true, user };
}

export function registrarDocente(
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
  forcedId?: string
): { ok: boolean; user?: Usuario; error?: string } {
  const all = getUsers();
  if (all.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "El correo ya está registrado." };
  }
  const id = forcedId || uid("usr");
  const user: Usuario = {
    id,
    nombre,
    email,
    password,
    rol,
    suscripcion: plan,
    estado_suscripcion: "ACTIVO",
    suscripcion_hasta: new Date(Date.now() + 30 * 86400000).toISOString(),
    colegio,
    nivel,
    ciclo,
    grado,
    allowed_subjects,
    creado_en: new Date().toISOString(),
  };
  saveUsuario(user);

  crearNotificacion(id, "¡Te damos la bienvenida! 🎓", "Tu cuenta como docente ha sido creada con éxito. Te invitamos a unirte a nuestro grupo de WhatsApp para soporte y comunidad: https://chat.whatsapp.com/CTxnZvEz6Qr2I2piuSNSDO");
  setSession({ user_id: id, iniciado_en: new Date().toISOString() });
  return { ok: true, user };
}

export function logout() {
  setSession(null);
}

// ============ Classrooms & Students ============
export function getClassrooms(docente_id: string): Classroom[] {
  return read<Classroom[]>(KEY.classrooms, []).filter((c) => c.docente_id === docente_id);
}
export function getAllClassroomsAdmin(): Classroom[] {
  return read<Classroom[]>(KEY.classrooms, []);
}
export function saveClassroom(c: Classroom) {
  const all = read<Classroom[]>(KEY.classrooms, []);
  const i = all.findIndex((x) => x.id === c.id);
  if (i >= 0) all[i] = c;
  else all.push(c);
  write(KEY.classrooms, all);

  classroomsService.saveClassroom(c).catch((err) => {
    console.error("Error syncing classroom to Supabase:", err);
  });
}
export function deleteClassroom(classroomId: string) {
  const allC = read<Classroom[]>(KEY.classrooms, []);
  write(KEY.classrooms, allC.filter((c) => c.id !== classroomId));
  // Also remove all students belonging to this classroom
  const allS = read<Student[]>(KEY.students, []);
  write(KEY.students, allS.filter((s) => s.classroom_id !== classroomId));

  classroomsService.deleteClassroom(classroomId).catch((err) => {
    console.error("Error deleting classroom from Supabase:", err);
  });
}
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function isAvatarUrlValid(url: string | undefined, genero: "M" | "F"): boolean {
  if (!url || !url.includes("adventurer-neutral")) return false;

  try {
    const urlObj = new URL(url);
    const bg = urlObj.searchParams.get("backgroundColor");

    if (!bg) return false;

    const girlBgs = ["ffccd5", "ffebf0", "ffd6ba", "e8dbfc", "ffb5a7"];
    const boyBgs = ["b6e3f4", "c0d6df", "c1f0c1", "d8f3dc", "d8e2dc"];
    const validBgs = genero === "F" ? girlBgs : boyBgs;

    return validBgs.includes(bg);
  } catch {
    return false;
  }
}

export function getStudents(classroom_id: string): Student[] {
  const all = read<Student[]>(KEY.students, []);
  const filtered = all.filter((s) => s.classroom_id === classroom_id);
  let changed = false;

  filtered.forEach((s) => {
    if (!isAvatarUrlValid(s.avatar_url, s.genero)) {
      const randomSeed = `std_${Math.random().toString(36).substring(2, 9)}`;
      s.avatar_url = getStudentAvatarUrl(randomSeed, s.genero);
      changed = true;

      // Update in the master array
      const idx = all.findIndex((x) => x.id === s.id);
      if (idx >= 0) {
        all[idx] = s;
      }
    }
  });

  if (changed) {
    write(KEY.students, all);
    // Sync migrated students to Supabase in the background
    filtered.forEach((s) => {
      studentsService.saveStudent(s).catch((err) => {
        console.error("Error syncing migrated student to Supabase:", err);
      });
    });
  }

  return filtered;
}

export function getStudentAvatarUrl(seed: string, genero: "M" | "F"): string {
  const hash = hashCode(seed);

  // Gender-coded background color palettes (warm pastels for girls, cool pastels for boys)
  const girlBgs = ["ffccd5", "ffebf0", "ffd6ba", "e8dbfc", "ffb5a7"];
  const boyBgs = ["b6e3f4", "c0d6df", "c1f0c1", "d8f3dc", "d8e2dc"];
  const chosenBg = genero === "F" 
    ? girlBgs[hash % girlBgs.length] 
    : boyBgs[hash % boyBgs.length];

  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${seed}&backgroundColor=${chosenBg}`;
}

export function getStudentAvatar(s: Student): string {
  if (isAvatarUrlValid(s.avatar_url, s.genero)) {
    return s.avatar_url!;
  }
  return getStudentAvatarUrl(s.id, s.genero);
}

export function saveStudent(s: Student) {
  const all = read<Student[]>(KEY.students, []);
  const i = all.findIndex((x) => x.id === s.id);

  if (i >= 0) {
    const existing = all[i];
    if (existing.genero !== s.genero || !isAvatarUrlValid(s.avatar_url, s.genero)) {
      const randomSeed = `std_${Math.random().toString(36).substring(2, 9)}`;
      s.avatar_url = getStudentAvatarUrl(randomSeed, s.genero);
    }
  } else {
    if (!isAvatarUrlValid(s.avatar_url, s.genero)) {
      const randomSeed = `std_${Math.random().toString(36).substring(2, 9)}`;
      s.avatar_url = getStudentAvatarUrl(randomSeed, s.genero);
    }
  }

  if (i >= 0) all[i] = s;
  else all.push(s);
  write(KEY.students, all);

  studentsService.saveStudent(s).catch((err) => {
    console.error("Error syncing student to Supabase:", err);
  });
}
export function deleteStudent(studentId: string) {
  const all = read<Student[]>(KEY.students, []);
  const filtered = all.filter((x) => x.id !== studentId);
  write(KEY.students, filtered);

  studentsService.deleteStudent(studentId).catch((err) => {
    console.error("Error deleting student from Supabase:", err);
  });
}

// ============ Attendance ============
export function getAttendance(classroom_id: string): Attendance[] {
  return read<Attendance[]>(KEY.attendance, []).filter((a) => a.classroom_id === classroom_id);
}
export async function syncAttendanceFromServer(classroom_id: string): Promise<Attendance[]> {
  try {
    const remoteRecords = await attendanceService.fetchAttendance(classroom_id);
    const all = read<Attendance[]>(KEY.attendance, []);
    const filtered = all.filter((a) => a.classroom_id !== classroom_id);
    const merged = [...filtered, ...remoteRecords];
    write(KEY.attendance, merged);
    return remoteRecords;
  } catch (err) {
    console.error("Error syncing attendance from server:", err);
    return getAttendance(classroom_id);
  }
}
export function saveAttendance(a: Attendance) {
  const all = read<Attendance[]>(KEY.attendance, []);
  const i = all.findIndex((x) => x.classroom_id === a.classroom_id && x.fecha === a.fecha);
  if (i >= 0) all[i] = a;
  else all.push(a);
  write(KEY.attendance, all);

  attendanceService.saveAttendance(a).catch((err) => {
    console.error("Error syncing attendance to Supabase:", err);
  });
}

// ============ Anecdotal Records & Incidences ============
export function getAnecdotalRecords(classroom_id: string): AnecdotalRecord[] {
  return read<AnecdotalRecord[]>(KEY.anecdotal, []).filter((r) => r.classroom_id === classroom_id);
}
export function getStudentAnecdotalRecords(student_id: string): AnecdotalRecord[] {
  return read<AnecdotalRecord[]>(KEY.anecdotal, []).filter((r) => r.student_id === student_id);
}
export function saveAnecdotalRecord(r: AnecdotalRecord) {
  const all = read<AnecdotalRecord[]>(KEY.anecdotal, []);
  const i = all.findIndex((x) => x.id === r.id);
  if (i >= 0) all[i] = r;
  else all.push(r);
  write(KEY.anecdotal, all);

  incidentsService.saveAnecdotalRecord(r).catch((err) => {
    console.error("Error syncing anecdotal to Supabase:", err);
  });
}
export function getIncidences(student_id: string): Incidence[] {
  return read<Incidence[]>(KEY.incidences, []).filter((i) => i.student_id === student_id);
}
export function saveIncidence(i: Incidence) {
  const all = read<Incidence[]>(KEY.incidences, []);
  const idx = all.findIndex((x) => x.id === i.id);
  if (idx >= 0) all[idx] = i;
  else all.push(i);
  write(KEY.incidences, all);

  incidentsService.saveIncidence(i).catch((err) => {
    console.error("Error syncing incidence to Supabase:", err);
  });
}

// ============ Official Grades ============
export function getOfficialGrades(classroom_id: string, subject_id: string): OfficialGradeRecord[] {
  return read<OfficialGradeRecord[]>(KEY.official_grades, []).filter(
    (g) => g.classroom_id === classroom_id && g.subject_id === subject_id
  );
}
export async function syncOfficialGradesFromServer(classroom_id: string, subject_id: string): Promise<OfficialGradeRecord[]> {
  try {
    const remoteRecords = await gradesService.fetchOfficialGrades(classroom_id, subject_id);
    const all = read<OfficialGradeRecord[]>(KEY.official_grades, []);
    const filtered = all.filter(
      (g) => !(g.classroom_id === classroom_id && g.subject_id === subject_id)
    );
    const merged = [...filtered, ...remoteRecords];
    write(KEY.official_grades, merged);
    return remoteRecords;
  } catch (err) {
    console.error("Error syncing official grades from server:", err);
    return getOfficialGrades(classroom_id, subject_id);
  }
}
export function saveOfficialGrades(records: OfficialGradeRecord[]) {
  const all = read<OfficialGradeRecord[]>(KEY.official_grades, []);
  for (const rec of records) {
    const idx = all.findIndex(
      (x) => x.student_id === rec.student_id && x.subject_id === rec.subject_id && x.competency_id === rec.competency_id && x.academic_year === rec.academic_year
    );
    if (idx >= 0) all[idx] = rec;
    else all.push(rec);
  }
  write(KEY.official_grades, all);

  gradesService.saveOfficialGrades(records).catch((err) => {
    console.error("Error syncing grades to Supabase:", err);
  });
}
export function getStudentOfficialGrades(student_id: string): OfficialGradeRecord[] {
  return read<OfficialGradeRecord[]>(KEY.official_grades, []).filter((g) => g.student_id === student_id);
}

// ============ Rubrics & Evaluations ============
export function getRubrics(docente_id: string): Rubric[] {
  return read<Rubric[]>(KEY.rubrics, []).filter((r) => r.docente_id === docente_id);
}
export function saveRubric(r: Rubric) {
  const all = read<Rubric[]>(KEY.rubrics, []);
  const i = all.findIndex((x) => x.id === r.id);
  if (i >= 0) all[i] = r;
  else all.push(r);
  write(KEY.rubrics, all);

  rubricsService.saveRubric(r).catch((err) => {
    console.error("Error syncing rubric to Supabase:", err);
  });
}
export function deleteRubric(id: string) {
  const all = read<Rubric[]>(KEY.rubrics, []);
  write(KEY.rubrics, all.filter((r) => r.id !== id));

  rubricsService.deleteRubric(id).catch((err) => {
    console.error("Error deleting rubric from Supabase:", err);
  });
}
export function getStudentEvaluations(rubric_id: string): StudentEvaluation[] {
  return read<StudentEvaluation[]>(KEY.evaluations, []).filter((e) => e.rubric_id === rubric_id);
}
export function saveStudentEvaluation(e: StudentEvaluation) {
  const all = read<StudentEvaluation[]>(KEY.evaluations, []);
  const i = all.findIndex((x) => x.id === e.id);
  if (i >= 0) all[i] = e;
  else all.push(e);
  write(KEY.evaluations, all);

  // We need to fetch classroom to determine level if possible, but default is fine
  evaluationsService.saveStudentEvaluation(e).catch((err) => {
    console.error("Error syncing student evaluation to Supabase:", err);
  });
}
export function getStudentRubricEvaluations(student_id: string): StudentEvaluation[] {
  return read<StudentEvaluation[]>(KEY.evaluations, []).filter((e) => e.student_id === student_id);
}
export function getAllRubrics(): Rubric[] {
  return read<Rubric[]>(KEY.rubrics, []);
}

// ============ Lesson Plans ============
export function getLessonPlans(docente_id: string): LessonPlan[] {
  return read<LessonPlan[]>(KEY.lesson_plans, []).filter((p) => p.docente_id === docente_id);
}
export function getAllLessonPlansAdmin(): LessonPlan[] {
  return read<LessonPlan[]>(KEY.lesson_plans, []);
}
export function saveLessonPlan(p: LessonPlan) {
  const all = read<LessonPlan[]>(KEY.lesson_plans, []);
  const i = all.findIndex((x) => x.id === p.id);
  if (i >= 0) all[i] = p;
  else all.push(p);
  write(KEY.lesson_plans, all);
  savePlanning(p)
    .then((savedPlan) => {
      // Sync the generated UUID back to localStorage to prevent duplicates
      const currentAll = read<LessonPlan[]>(KEY.lesson_plans, []);
      const index = currentAll.findIndex((x) => x.id === p.id || x.id === savedPlan.id);
      if (index >= 0) {
        currentAll[index] = savedPlan;
        write(KEY.lesson_plans, currentAll);
      }
    })
    .catch(err => console.error("Error saving planning to Supabase:", err));
}
export function deleteLessonPlan(id: string) {
  const all = read<LessonPlan[]>(KEY.lesson_plans, []);
  write(KEY.lesson_plans, all.filter((p) => p.id !== id));
  deletePlanning(id).catch(err => console.error("Error deleting planning from Supabase:", err));
}

// ============ Community Posts ============
export function getCommunityPosts(): CommunityPost[] {
  return read<CommunityPost[]>(KEY.community, []);
}
export function saveCommunityPost(p: CommunityPost) {
  const all = getCommunityPosts();
  const i = all.findIndex((x) => x.id === p.id);
  if (i >= 0) all[i] = p;
  else all.push(p);
  write(KEY.community, all);
}
export function deleteCommunityPost(id: string) {
  const all = getCommunityPosts();
  write(KEY.community, all.filter((p) => p.id !== id));
}

// ============ Ephemerides ============
export function getEphemerides(): Ephemeris[] {
  return read<Ephemeris[]>(KEY.ephemerides, []);
}
export function saveEphemeris(e: Ephemeris) {
  const all = getEphemerides();
  const i = all.findIndex((x) => x.id === e.id);
  if (i >= 0) all[i] = e;
  else all.push(e);
  write(KEY.ephemerides, all);
}
export function deleteEphemeris(id: string) {
  const all = getEphemerides();
  write(KEY.ephemerides, all.filter((e) => e.id !== id));
}

// ============ Guides & Blog ============
export function getGuides(): Guide[] {
  return read<Guide[]>(KEY.guides, []);
}
export function saveGuide(g: Guide) {
  const all = getGuides();
  const i = all.findIndex((x) => x.id === g.id);
  if (i >= 0) all[i] = g;
  else all.push(g);
  write(KEY.guides, all);
}
export function deleteGuide(id: string) {
  const all = getGuides();
  write(KEY.guides, all.filter((g) => g.id !== id));
}

// ============ Notifications ============
export function getNotifications(docente_id: string): Notification[] {
  return read<Notification[]>(KEY.notifications, []).filter((n) => n.docente_id === docente_id);
}
export function crearNotificacion(docente_id: string, titulo: string, mensaje: string) {
  const all = read<Notification[]>(KEY.notifications, []);
  const notif: Notification = {
    id: uid("ntf"),
    docente_id,
    titulo,
    mensaje,
    leido: false,
    creado_en: new Date().toISOString(),
  };
  all.unshift(notif);
  write(KEY.notifications, all);
  playNotificationSound();
}
export function marcorNotificacionesLeidas(docente_id: string) {
  const all = read<Notification[]>(KEY.notifications, []);
  all.forEach((n) => {
    if (n.docente_id === docente_id) n.leido = true;
  });
  write(KEY.notifications, all);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function migrateIdsToUUIDs() {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const classroomsStr = localStorage.getItem("plx:classrooms");
    const studentsStr = localStorage.getItem("plx:students");
    const attendanceStr = localStorage.getItem("plx:attendance");
    const anecdotalStr = localStorage.getItem("plx:anecdotal");
    const incidencesStr = localStorage.getItem("plx:incidences");
    const evaluationsStr = localStorage.getItem("plx:evaluations");
    const officialGradesStr = localStorage.getItem("plx:official_grades");

    const classrooms = classroomsStr ? JSON.parse(classroomsStr) : [];
    const students = studentsStr ? JSON.parse(studentsStr) : [];
    const attendance = attendanceStr ? JSON.parse(attendanceStr) : [];
    const anecdotal = anecdotalStr ? JSON.parse(anecdotalStr) : [];
    const incidences = incidencesStr ? JSON.parse(incidencesStr) : [];
    const evaluations = evaluationsStr ? JSON.parse(evaluationsStr) : [];
    const officialGrades = officialGradesStr ? JSON.parse(officialGradesStr) : [];

    const classroomIdMap: Record<string, string> = {};
    const studentIdMap: Record<string, string> = {};
    let migrated = false;

    // 1. Migrate Classrooms
    classrooms.forEach((c: any) => {
      if (c.id && !UUID_REGEX.test(c.id)) {
        const newUuid = generateUUID();
        classroomIdMap[c.id] = newUuid;
        c.id = newUuid;
        migrated = true;
      }
    });

    // 2. Migrate Students
    students.forEach((s: any) => {
      if (s.classroom_id && classroomIdMap[s.classroom_id]) {
        s.classroom_id = classroomIdMap[s.classroom_id];
        migrated = true;
      }
      if (s.id && !UUID_REGEX.test(s.id)) {
        const newUuid = generateUUID();
        studentIdMap[s.id] = newUuid;
        s.id = newUuid;
        migrated = true;
      }
    });

    // 3. Migrate Attendance
    attendance.forEach((a: any) => {
      if (a.classroom_id && classroomIdMap[a.classroom_id]) {
        a.classroom_id = classroomIdMap[a.classroom_id];
        migrated = true;
      }
      if (a.registro) {
        const newRegistro: Record<string, string> = {};
        let registroChanged = false;
        Object.entries(a.registro).forEach(([sid, val]) => {
          const mappedSid = studentIdMap[sid];
          if (mappedSid) {
            newRegistro[mappedSid] = val as string;
            registroChanged = true;
          } else {
            newRegistro[sid] = val as string;
          }
        });
        if (registroChanged) {
          a.registro = newRegistro;
          migrated = true;
        }
      }
      if (a.classroom_id && a.fecha && a.id !== `att_${a.classroom_id}_${a.fecha}`) {
        a.id = `att_${a.classroom_id}_${a.fecha}`;
        migrated = true;
      }
    });

    // 4. Migrate Anecdotal
    anecdotal.forEach((an: any) => {
      if (an.classroom_id && classroomIdMap[an.classroom_id]) {
        an.classroom_id = classroomIdMap[an.classroom_id];
        migrated = true;
      }
      if (an.student_id && studentIdMap[an.student_id]) {
        an.student_id = studentIdMap[an.student_id];
        migrated = true;
      }
      if (an.id && !UUID_REGEX.test(an.id)) {
        an.id = generateUUID();
        migrated = true;
      }
    });

    // 5. Migrate Incidences
    incidences.forEach((in_rec: any) => {
      if (in_rec.student_id && studentIdMap[in_rec.student_id]) {
        in_rec.student_id = studentIdMap[in_rec.student_id];
        migrated = true;
      }
      if (in_rec.id && !UUID_REGEX.test(in_rec.id)) {
        in_rec.id = generateUUID();
        migrated = true;
      }
    });

    // 6. Migrate Evaluations
    evaluations.forEach((ev: any) => {
      if (ev.student_id && studentIdMap[ev.student_id]) {
        ev.student_id = studentIdMap[ev.student_id];
        migrated = true;
      }
      if (ev.id && !UUID_REGEX.test(ev.id)) {
        ev.id = generateUUID();
        migrated = true;
      }
    });

    // 7. Migrate Official Grades
    officialGrades.forEach((og: any) => {
      if (og.student_id && studentIdMap[og.student_id]) {
        og.student_id = studentIdMap[og.student_id];
        migrated = true;
      }
      if (og.classroom_id && classroomIdMap[og.classroom_id]) {
        og.classroom_id = classroomIdMap[og.classroom_id];
        migrated = true;
      }
      if (og.id && !UUID_REGEX.test(og.id)) {
        og.id = generateUUID();
        migrated = true;
      }
    });

    if (migrated) {
      localStorage.setItem("plx:classrooms", JSON.stringify(classrooms));
      localStorage.setItem("plx:students", JSON.stringify(students));
      localStorage.setItem("plx:attendance", JSON.stringify(attendance));
      localStorage.setItem("plx:anecdotal", JSON.stringify(anecdotal));
      localStorage.setItem("plx:incidences", JSON.stringify(incidences));
      localStorage.setItem("plx:evaluations", JSON.stringify(evaluations));
      localStorage.setItem("plx:official_grades", JSON.stringify(officialGrades));
      console.log("[Migration] Successfully migrated local IDs to standard UUIDs!");
    }
  } catch (err) {
    console.error("[Migration] Error migrating local IDs to UUIDs:", err);
  }
}

// Run migration immediately on file load
migrateIdsToUUIDs();
limpiarUsuariosLocales();

export function uid(prefix = "id"): string {
  const dbPrefixes = ["cls", "std", "rec", "inc", "att", "rub", "evl", "plan"];
  if (dbPrefixes.includes(prefix)) {
    return generateUUID();
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function generateWithIA(prompt: string, type: string): string {
  console.log(`[IA] Generando para tipo: ${type}. Prompt: ${prompt}`);
  if (type === "ANECDOTAL_REDRAFT") {
    return "El estudiante mostró iniciativa notable al organizar el equipo de masilla, asistiendo pacientemente a sus compañeros con menos destreza manual y manteniendo un diálogo respetuoso y enfocado en la meta de la clase física de geografía.";
  }
  return "Contenido generado con Inteligencia Artificial.";
}

export function limpiarUsuariosLocales() {
  if (!isBrowser()) return;
  const localUsersStr = localStorage.getItem("plx:users");
  if (localUsersStr) {
    try {
      const users = JSON.parse(localUsersStr) as Usuario[];
      const filtered = cleanUserList(users);
      if (filtered.length !== users.length) {
        localStorage.setItem("plx:users", JSON.stringify(filtered));
        console.log("[Cleanup] Cleaned up mock/test users from localStorage.");
      }
    } catch (e) {
      console.error("Error cleaning up local users:", e);
    }
  }
}

export function seedDemoIfEmpty() {
  if (!isBrowser()) return;

  // Clean up mock/test users from localStorage on load
  limpiarUsuariosLocales();

  const currentEphemerides = getEphemerides();
  if (currentEphemerides.length === 0) {
    const defaultEphemerides: Ephemeris[] = [
      { id: "efem_1", titulo: "Día de Juan Pablo Duarte", fecha: "01-26", descripcion: "Conmemoración del nacimiento del Padre de la Patria, Juan Pablo Duarte.", category: "Patria", is_holiday: false },
      { id: "efem_2", titulo: "Día de la Independencia Nacional 🇩🇴", fecha: "02-27", descripcion: "Celebración de la proclamación de la Independencia Nacional en la Puerta del Conde en 1844.", category: "Patria", is_holiday: true },
      { id: "efem_3", titulo: "Día de Francisco del Rosario Sánchez", fecha: "03-09", descripcion: "Nacimiento del prócer y Padre de la Patria Francisco del Rosario Sánchez.", category: "Patria", is_holiday: false },
      { id: "efem_4", titulo: "Día Panamericano", fecha: "04-14", descripcion: "Promueve la cooperación y la solidaridad entre los países de América.", category: "Educativa", is_holiday: false },
      { id: "efem_5", titulo: "Día del Trabajo", fecha: "05-01", descripcion: "Celebración internacional en homenaje a los trabajadores.", category: "Social", is_holiday: true },
      { id: "efem_6", titulo: "Día del Maestro dominicano 🍎", fecha: "06-30", descripcion: "Reconocimiento nacional a la labor, dedicación e impacto social de los educadores dominicanos.", category: "Educativa", is_holiday: false },
      { id: "efem_7", titulo: "Día de la Restauración de la República", fecha: "08-16", descripcion: "Conmemoración del inicio de la guerra restauradora en 1863 para restablecer la soberanía nacional.", category: "Patria", is_holiday: true },
      { id: "efem_8", titulo: "Día de Nuestra Señora de las Mercedes", fecha: "09-24", descripcion: "Celebración del día de la patrona del pueblo dominicano.", category: "Cultural", is_holiday: true },
      { id: "efem_9", titulo: "Día del Encuentro de Culturas", fecha: "10-12", descripcion: "Recordatorio de la llegada de Cristóbal Colón al continente americano en 1492.", category: "Historia", is_holiday: false },
      { id: "efem_10", titulo: "Día de la Constitución Dominicana", fecha: "11-06", descripcion: "Firma de la primera constitución de la República Dominicana en San Cristóbal en 1844.", category: "Patria", is_holiday: true },
      { id: "efem_11", titulo: "Día de las Hermanas Mirabal", fecha: "11-25", descripcion: "Homenaje a las heroínas Patria, Minerva y María Teresa Mirabal, fecha declarada Día Internacional de la Eliminación de la Violencia contra la Mujer.", category: "Derechos Humanos", is_holiday: false },
      { id: "efem_12", titulo: "Día de la Declaración Universal de los Derechos Humanos", fecha: "12-10", descripcion: "Aniversario de la proclamación de la declaración universal de derechos humanos por la ONU.", category: "Derechos Humanos", is_holiday: false }
    ];
    defaultEphemerides.forEach(saveEphemeris);
  }

  const users = getUsers();
  const alreadyHasUsers = users.length > 0;
  const docenteId = "usr_demo_admin"; // Assign all demo teacher assets to admin
  const adminId = "usr_demo_admin";
  const hoyStr = new Date().toISOString().split("T")[0];

  if (!alreadyHasUsers) {
    console.log("[Planix Seed] Sembrando base de datos escolar demo...");

    const admin: Usuario = {
      id: adminId,
      nombre: "Yeri Orlando",
      email: "admin@planix.do",
      password: "demo1234",
      rol: "admin",
      suscripcion: "pro",
      estado_suscripcion: "ACTIVO",
      suscripcion_hasta: new Date(Date.now() + 365 * 86400000).toISOString(),
      creado_en: new Date().toISOString(),
    };
    saveUsuario(admin);

    const class1: Classroom = {
      id: "cls_4to_a",
      docente_id: docenteId,
      nombre: "4to de Primaria - Sección A",
      nivel: "primaria",
      grado: "primaria-4to",
      seccion: "A",
      periodo: "2025-2026",
      creado_en: new Date().toISOString(),
    };
    saveClassroom(class1);

    const class2: Classroom = {
      id: "cls_2do_sec",
      docente_id: docenteId,
      nombre: "2do de Secundaria - Sección B",
      nivel: "secundaria",
      grado: "secundaria-2do",
      seccion: "B",
      periodo: "2025-2026",
      creado_en: new Date().toISOString(),
    };
    saveClassroom(class2);

    const estudiantes4to = [
      { nombre: "Sofía Castillo Rosado", genero: "F" as const, num: 1 },
      { nombre: "Mateo Almonte Medina", genero: "M" as const, num: 2 },
      { nombre: "Camila Vargas Guerrero", genero: "F" as const, num: 3 },
      { nombre: "Sebastián De la Cruz", genero: "M" as const, num: 4 },
      { nombre: "Isabella Ortiz Pérez", genero: "F" as const, num: 5 },
      { nombre: "Lucas Santana Rojas", genero: "M" as const, num: 6 },
    ];
    estudiantes4to.forEach((st) => {
      saveStudent({
        id: uid("std"),
        classroom_id: "cls_4to_a",
        nombre: st.nombre,
        numero_orden: st.num,
        genero: st.genero,
        email_tutor: `${st.nombre.split(" ")[0].toLowerCase()}@tutor.com`,
        telefono_tutor: "809-555-0100",
        creado_en: new Date().toISOString(),
      });
    });

    const estudiantes2doS = [
      { nombre: "Ángel Gabriel Tejeda", genero: "M" as const, num: 1 },
      { nombre: "Laura Jiminián Peña", genero: "F" as const, num: 2 },
      { nombre: "Diego Manuel Abreu", genero: "M" as const, num: 3 },
      { nombre: "Mia Nicolle Soriano", genero: "F" as const, num: 4 },
      { nombre: "Carlos Eduardo Muñoz", genero: "M" as const, num: 5 },
      { nombre: "Valentina Marie Ruiz", genero: "F" as const, num: 6 },
    ];
    estudiantes2doS.forEach((st) => {
      saveStudent({
        id: uid("std"),
        classroom_id: "cls_2do_sec",
        nombre: st.nombre,
        numero_orden: st.num,
        genero: st.genero,
        email_tutor: `${st.nombre.split(" ")[0].toLowerCase()}@tutor.com`,
        telefono_tutor: "829-555-0200",
        creado_en: new Date().toISOString(),
      });
    });

    const studentsCls1 = getStudents("cls_4to_a");
    if (studentsCls1.length > 0) {
      saveAnecdotalRecord({
        id: "rec_anec_1",
        classroom_id: "cls_4to_a",
        student_id: studentsCls1[0].id,
        docente_id: docenteId,
        fecha: hoyStr,
        hecho: "Sofía ayudó activamente a organizar el aula tras el trabajo grupal con masilla.",
        sugerencia_ia: "La estudiante demuestra una alta competencia de colaboración. Sería idóneo felicitar su conducta frente a su tutor.",
        estado: "guardado",
        creado_en: new Date().toISOString(),
      });
    }

    const ephemeridesData: Ephemeris[] = [
      { id: "efem_1", titulo: "Día de Juan Pablo Duarte", fecha: "01-26", descripcion: "Conmemoración del nacimiento del Padre de la Patria, Juan Pablo Duarte.", category: "Patria", is_holiday: false },
      { id: "efem_2", titulo: "Día de la Independencia Nacional 🇩🇴", fecha: "02-27", descripcion: "Celebración de la proclamación de la Independencia Nacional en la Puerta del Conde en 1844.", category: "Patria", is_holiday: true },
      { id: "efem_3", titulo: "Día de Francisco del Rosario Sánchez", fecha: "03-09", descripcion: "Nacimiento del prócer y Padre de la Patria Francisco del Rosario Sánchez.", category: "Patria", is_holiday: false },
      { id: "efem_4", titulo: "Día Panamericano", fecha: "04-14", descripcion: "Promueve la cooperación y la solidaridad entre los países de América.", category: "Educativa", is_holiday: false },
      { id: "efem_5", titulo: "Día del Trabajo", fecha: "05-01", descripcion: "Celebración internacional en homenaje a los trabajadores.", category: "Social", is_holiday: true },
      { id: "efem_6", titulo: "Día del Maestro dominicano 🍎", fecha: "06-30", descripcion: "Reconocimiento nacional a la labor, dedicación e impacto social de los educadores dominicanos.", category: "Educativa", is_holiday: false },
      { id: "efem_7", titulo: "Día de la Restauración de la República", fecha: "08-16", descripcion: "Conmemoración del inicio de la guerra restauradora en 1863 para restablecer la soberanía nacional.", category: "Patria", is_holiday: true },
      { id: "efem_8", titulo: "Día de Nuestra Señora de las Mercedes", fecha: "09-24", descripcion: "Celebración del día de la patrona del pueblo dominicano.", category: "Cultural", is_holiday: true },
      { id: "efem_9", titulo: "Día del Encuentro de Culturas", fecha: "10-12", descripcion: "Recordatorio de la llegada de Cristóbal Colón al continente americano en 1492.", category: "Historia", is_holiday: false },
      { id: "efem_10", titulo: "Día de la Constitución Dominicana", fecha: "11-06", descripcion: "Firma de la primera constitución de la República Dominicana en San Cristóbal en 1844.", category: "Patria", is_holiday: true },
      { id: "efem_11", titulo: "Día de las Hermanas Mirabal", fecha: "11-25", descripcion: "Homenaje a las heroínas Patria, Minerva y María Teresa Mirabal, fecha declarada Día Internacional de la Eliminación de la Violencia contra la Mujer.", category: "Derechos Humanos", is_holiday: false },
      { id: "efem_12", titulo: "Día de la Declaración Universal de los Derechos Humanos", fecha: "12-10", descripcion: "Aniversario de la proclamación de la declaración universal de derechos humanos por la ONU.", category: "Derechos Humanos", is_holiday: false }
    ];
    ephemeridesData.forEach(saveEphemeris);
  }

  // Sembrar asistencia para el mes actual
  const studentsCls1 = getStudents("cls_4to_a");
  const studentsCls2 = getStudents("cls_2do_sec");
  const attendanceRecords = getAttendance("cls_4to_a");

  if (studentsCls1.length > 0 && attendanceRecords.length === 0) {
    const juneWeekdays: string[] = [];
    const year = new Date().getFullYear();
    const month = new Date().getMonth(); // Mes actual
    for (let day = 1; day <= 30; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        juneWeekdays.push(dateStr);
      }
    }

    juneWeekdays.forEach((dateStr, dayIdx) => {
      const reg: Record<string, "P" | "A" | "T" | "E"> = {};
      studentsCls1.forEach((st, sIdx) => {
        const hash = (dayIdx * 7 + sIdx * 13) % 100;
        if (hash < 88) reg[st.id] = "P";
        else if (hash < 93) reg[st.id] = "A";
        else if (hash < 97) reg[st.id] = "T";
        else reg[st.id] = "E";
      });
      saveAttendance({ id: uid("att"), classroom_id: "cls_4to_a", fecha: dateStr, registro: reg });
    });

    juneWeekdays.forEach((dateStr, dayIdx) => {
      const reg: Record<string, "P" | "A" | "T" | "E"> = {};
      studentsCls2.forEach((st, sIdx) => {
        const hash = (dayIdx * 9 + sIdx * 11) % 100;
        if (hash < 89) reg[st.id] = "P";
        else if (hash < 93) reg[st.id] = "A";
        else if (hash < 97) reg[st.id] = "T";
        else reg[st.id] = "E";
      });
      saveAttendance({ id: uid("att"), classroom_id: "cls_2do_sec", fecha: dateStr, registro: reg });
    });
  }
  migrateIdsToUUIDs();
}
