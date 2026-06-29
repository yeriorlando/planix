import type { LessonPlan } from "../storage";
import { requestD1 } from "./d1Client";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Generate a UUID v4
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

// Persistent mapping of local IDs → UUIDs
const localToUuidMap = new Map<string, string>();
try {
  const mapStr = localStorage?.getItem('plx:id_uuid_map') || '{}';
  const map = JSON.parse(mapStr);
  for (const [k, v] of Object.entries(map)) {
    localToUuidMap.set(k, v as string);
  }
} catch (e) { /* ignore in SSR */ }

function ensureUUID(id: string): string {
  if (UUID_REGEX.test(id)) return id;
  if (localToUuidMap.has(id)) return localToUuidMap.get(id)!;
  const uuid = generateUUID();
  localToUuidMap.set(id, uuid);
  try {
    const mapStr = localStorage.getItem('plx:id_uuid_map') || '{}';
    const map = JSON.parse(mapStr);
    map[id] = uuid;
    localStorage.setItem('plx:id_uuid_map', JSON.stringify(map));
  } catch (e) { /* ignore */ }
  return uuid;
}

/**
 * Detects if the Supabase row was saved by Planix 2.0 (Next.js app)
 * vs Planix1 (Vite app). Planix 2.0 stores data in content.formData,
 * while Planix1 stores the full LessonPlan directly in content.
 */
function isPlanix2Format(content: any): boolean {
  return !!(content.formData && typeof content.formData === 'object');
}

/**
 * Maps a Supabase plannings row to a LessonPlan.
 * Supports BOTH Planix 2.0 format (content.formData) and Planix1 format (content = LessonPlan).
 */
export function mapPlanningFromDb(row: any): LessonPlan {
  const content = typeof row.content === 'string' ? JSON.parse(row.content) : (row.content || {});

  if (isPlanix2Format(content)) {
    // ==================== PLANIX 2.0 FORMAT ====================
    const fd = content.formData;
    
    // Convert Planix 2.0 momentos array to LessonPlan momentos object
    const momentosArr = fd.momentos || [];
    const inicio = momentosArr[0]?.descripcion || '';
    const desarrollo = momentosArr[1]?.descripcion || '';
    const cierre = momentosArr[2]?.descripcion || '';

    return {
      id: row.id,
      docente_id: row.user_id,
      titulo: fd.actividad_titulo || content.sequence || row.title || '',
      tipo: (content.curriculum_type === 'CON_BASE' ? 'CON_BASE' : 'CURRICULAR') as any,
      nivel: (fd.grado || '').toLowerCase().includes('secundaria') ? 'secundaria' 
           : (fd.grado || '').toLowerCase().includes('inicial') ? 'inicial' 
           : 'primaria',
      grado: fd.grado || '',
      asignatura: fd.area || content.subject || '',
      secuencia_id: content.sequence_id || '',
      bloque_id: '',
      actividad_id: fd.actividad_id || '',
      intencion_pedagogica: fd.intencion_pedagogica || '',
      recursos: Array.isArray(fd.recursos) ? fd.recursos : (fd.recursos ? [fd.recursos] : []),
      momentos: { inicio, desarrollo, cierre },
      tarea: fd.tarea_casa || fd.tarea_hogar || '',
      conceptual: '',
      procedimental: '',
      actitudinal: '',
      evaluacion: fd.evaluacion || '',
      creado_en: content.created_at || row.created_at || new Date().toISOString(),
      customFields: {
        ...fd,
        centro_educativo: fd.centro_educativo || '',
        seccion: fd.seccion || content.section || 'A',
        fecha: fd.fecha || content.date || '',
        bloque: fd.bloque || '',
        secuencia: content.sequence || '',
        estado: content.status || 'Borrador',
        // Preserve the original momentos array for PrintLayout
        momentos: momentosArr,
      },
      customFormSchema: null,
    };
  }

  // ==================== PLANIX1 FORMAT ====================
  // content IS the LessonPlan object directly
  return {
    id: row.id,
    docente_id: row.user_id || content.docente_id,
    titulo: row.title || content.titulo || '',
    tipo: (content.tipo as "CON_BASE" | "CURRICULAR") || 'CURRICULAR',
    nivel: content.nivel || 'primaria',
    grado: content.grado || '',
    asignatura: content.asignatura || '',
    secuencia_id: content.secuencia_id || '',
    bloque_id: content.bloque_id || '',
    actividad_id: content.actividad_id || '',
    intencion_pedagogica: content.intencion_pedagogica || '',
    recursos: content.recursos || [],
    momentos: content.momentos || { inicio: '', desarrollo: '', cierre: '' },
    tarea: content.tarea || '',
    conceptual: content.conceptual || '',
    procedimental: content.procedimental || '',
    actitudinal: content.actitudinal || '',
    evaluacion: content.evaluacion || '',
    creado_en: row.created_at || content.creado_en || new Date().toISOString(),
    customFields: content.customFields || {},
    customFormSchema: content.customFormSchema || null,
  };
}

export function mapPlanningToDb(p: LessonPlan) {
  const uuidId = ensureUUID(p.id);
  const subjectId = (p.secuencia_id && UUID_REGEX.test(p.secuencia_id)) ? p.secuencia_id : null;
  const gradeId = (p.grado && UUID_REGEX.test(p.grado)) ? p.grado : null;

  return {
    id: uuidId,
    user_id: p.docente_id,
    title: p.titulo,
    type: p.tipo,
    subject_id: subjectId,
    grade_id: gradeId,
    status: p.customFields?.estado || 'Borrador',
    content: { ...p, _original_local_id: p.id },
    created_at: p.creado_en || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false,
  };
}

export async function fetchPlannings(userId: string): Promise<LessonPlan[]> {
  const data = await requestD1<any[]>(`/api/plannings?user_id=${userId}`);
  return data.map(mapPlanningFromDb);
}

export async function fetchPlanningById(id: string): Promise<LessonPlan> {
  const data = await requestD1<any[]>(`/api/plannings?id=${id}`);
  if (!data || data.length === 0) {
    throw new Error("Planificación no encontrada");
  }
  return mapPlanningFromDb(data[0]);
}

export async function savePlanning(p: LessonPlan): Promise<LessonPlan> {
  const dbRow = mapPlanningToDb(p);
  await requestD1<any>("/api/plannings", "POST", dbRow);
  return { ...p, id: dbRow.id };
}

export async function deletePlanning(id: string): Promise<void> {
  const uuidId = UUID_REGEX.test(id) ? id : (localToUuidMap.get(id) || id);
  await requestD1<any>(`/api/plannings/${uuidId}`, "DELETE");
}
