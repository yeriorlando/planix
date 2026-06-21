import type { Rubric } from "../storage";
import { requestD1 } from "./d1Client";

export function mapCriteriaFromDb(c: any): any {
  return {
    id: c.id,
    nombre: c.name || c.nombre || "",
    peso: c.peso !== undefined ? c.peso : (c.weight !== undefined ? c.weight : 0),
    descripcion: c.description || c.descripcion || "",
    niveles: (c.levels || c.niveles || []).map((lvl: any) => ({
      nombre: lvl.label || lvl.nombre || "",
      puntos: lvl.puntos !== undefined ? lvl.puntos : (lvl.score !== undefined ? lvl.score : 0),
      description: lvl.description || lvl.descripcion || "",
    })),
  };
}

export function mapCriteriaToDb(c: any): any {
  return {
    id: c.id || Math.random().toString(),
    name: c.nombre || c.name || "",
    peso: c.peso !== undefined ? c.peso : 0,
    description: c.descripcion || c.description || "",
    levels: (c.niveles || c.levels || []).map((lvl: any) => ({
      label: lvl.nombre || lvl.label || "",
      score: lvl.puntos !== undefined ? lvl.puntos : (lvl.score !== undefined ? lvl.score : 0),
      description: lvl.description || lvl.descripcion || "",
    })),
  };
}

export function mapRubricFromDb(row: any): Rubric {
  return {
    id: row.id,
    docente_id: row.teacher_id,
    titulo: row.title,
    descripcion: row.description || "",
    criterios: (row.criteria || []).map(mapCriteriaFromDb),
    tipo: row.type || "RUBRIC",
    creado_en: row.created_at || new Date().toISOString(),
  };
}

export function mapRubricToDb(r: Rubric) {
  return {
    id: r.id,
    teacher_id: r.docente_id,
    title: r.titulo,
    description: r.descripcion,
    criteria: (r.criterios || []).map(mapCriteriaToDb),
    type: r.tipo || "RUBRIC",
    created_at: r.creado_en,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchRubrics(teacherId: string): Promise<Rubric[]> {
  const data = await requestD1<any[]>(`/api/rubrics?teacher_id=${teacherId}`);
  return data.map(mapRubricFromDb);
}

export async function saveRubric(r: Rubric): Promise<Rubric> {
  const dbRow = mapRubricToDb(r);
  await requestD1<any>("/api/rubrics", "POST", dbRow);
  return r;
}

export async function deleteRubric(id: string): Promise<void> {
  await requestD1<any>(`/api/rubrics/${id}`, "DELETE");
}

// Rubric Classroom Metadata
export interface RubricMetadata {
  rubric_id: string;
  classroom_id: string;
  indicators: any[];
  competencies: any[];
}

export async function fetchRubricMetadata(
  rubricId: string,
  classroomId: string
): Promise<RubricMetadata | null> {
  const data = await requestD1<any>(`/api/rubric-metadata?rubric_id=${rubricId}&classroom_id=${classroomId}`);
  if (!data) return null;

  return {
    rubric_id: data.rubric_id,
    classroom_id: data.classroom_id,
    indicators: data.indicators || [],
    competencies: data.competencies || [],
  };
}

export async function saveRubricMetadata(meta: RubricMetadata): Promise<void> {
  await requestD1<any>("/api/rubric-metadata", "POST", {
    rubric_id: meta.rubric_id,
    classroom_id: meta.classroom_id,
    indicators: meta.indicators,
    competencies: meta.competencies,
  });
}
