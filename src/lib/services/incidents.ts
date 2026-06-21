import type { AnecdotalRecord, Incidence } from "../storage";
import { requestD1 } from "./d1Client";

// Anecdotal Records
export function mapAnecdotalFromDb(row: any): AnecdotalRecord {
  return {
    id: row.id,
    classroom_id: row.classroom_id,
    student_id: row.student_id,
    docente_id: row.teacher_id,
    fecha: row.date,
    hecho: row.description,
    sugerencia_ia: row.strategy || undefined,
    estado: (row.comment as any) || "guardado",
    creado_en: row.created_at || new Date().toISOString(),
  };
}

export function mapAnecdotalToDb(r: AnecdotalRecord) {
  return {
    id: r.id,
    student_id: r.student_id,
    teacher_id: r.docente_id,
    classroom_id: r.classroom_id,
    date: r.fecha || new Date().toISOString().split("T")[0],
    description: r.hecho,
    strategy: r.sugerencia_ia || null,
    comment: r.estado,
    period: "P1", // Default constraint placeholder
    area: "Académica", // Checked constraint
    is_weakness: false,
    created_at: r.creado_en,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchAnecdotalRecords(classroomId: string): Promise<AnecdotalRecord[]> {
  const data = await requestD1<any[]>(`/api/anecdotal-records?classroom_id=${classroomId}`);
  return (data || []).map(mapAnecdotalFromDb);
}

export async function fetchStudentAnecdotalRecords(studentId: string): Promise<AnecdotalRecord[]> {
  const data = await requestD1<any[]>(`/api/anecdotal-records?student_id=${studentId}`);
  return (data || []).map(mapAnecdotalFromDb);
}

export async function saveAnecdotalRecord(r: AnecdotalRecord): Promise<void> {
  const dbRow = mapAnecdotalToDb(r);
  await requestD1<any>("/api/anecdotal-records", "POST", dbRow);
}

export async function deleteAnecdotalRecord(id: string): Promise<void> {
  await requestD1<any>(`/api/anecdotal-records/${id}`, "DELETE");
}

// School Incidents
export async function fetchIncidences(studentId: string): Promise<Incidence[]> {
  const data = await requestD1<any[]>(`/api/school-incidents?student_id=${studentId}`);

  return (data || []).map((row: any) => ({
    id: row.id,
    student_id: row.student_id,
    fecha: row.incident_date,
    descripcion: row.description || "",
    gravedad: (row.incident_type as any) || "leve",
    medidas_tomadas: row.actions_taken || "",
  }));
}

export async function saveIncidence(i: Incidence): Promise<void> {
  // Try to find the classroom_id for this student
  let classroomId: string | null = null;
  try {
    const student = await requestD1<any>(`/api/students/${i.student_id}`);
    if (student) {
      classroomId = student.classroom_id;
    }
  } catch (err) {
    console.warn("Failed to fetch student's classroom for incident:", err);
  }

  const dbRow = {
    id: i.id,
    student_id: i.student_id,
    teacher_id: "", // default empty
    classroom_id: classroomId,
    incident_date: i.fecha,
    incident_type: i.gravedad,
    description: i.descripcion,
    actions_taken: i.medidas_tomadas || null,
    observations: null,
  };

  await requestD1<any>("/api/school-incidents", "POST", dbRow);
}

export async function deleteIncidence(id: string): Promise<void> {
  await requestD1<any>(`/api/school-incidents/${id}`, "DELETE");
}
