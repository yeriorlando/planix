import type { Classroom } from "../storage";
import { requestD1 } from "./d1Client";

export function mapClassroomFromDb(row: any): Classroom {
  let nivel: "inicial" | "primaria" | "secundaria" = "primaria";
  const g = row.grade?.toLowerCase() || "";
  if (g.includes("sec")) {
    nivel = "secundaria";
  } else if (
    g.includes("maternal") ||
    g.includes("infantes") ||
    g.includes("párvulos") ||
    g.includes("kinder") ||
    g.includes("pre-primario") ||
    g.includes("inicial")
  ) {
    nivel = "inicial";
  }

  return {
    id: row.id,
    docente_id: row.teacher_id,
    nombre: row.name,
    nivel,
    grado: row.grade,
    seccion: row.section || "",
    periodo: row.academic_year,
    creado_en: row.created_at || new Date().toISOString(),
  };
}

export function mapClassroomToDb(c: Classroom) {
  return {
    id: c.id,
    teacher_id: c.docente_id,
    name: c.nombre,
    grade: c.grado,
    section: c.seccion,
    academic_year: c.periodo,
    created_at: c.creado_en,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchClassrooms(teacherId: string): Promise<Classroom[]> {
  const data = await requestD1<any[]>(`/api/classrooms?teacher_id=${teacherId}`);
  return data.map(mapClassroomFromDb);
}

export async function fetchAllClassroomsAdmin(): Promise<Classroom[]> {
  const data = await requestD1<any[]>("/api/classrooms");
  return data.map(mapClassroomFromDb);
}

export async function saveClassroom(c: Classroom): Promise<Classroom> {
  const dbRow = mapClassroomToDb(c);
  await requestD1<any>("/api/classrooms", "POST", dbRow);
  return c;
}

export async function deleteClassroom(id: string): Promise<void> {
  await requestD1<any>(`/api/classrooms/${id}`, "DELETE");
}
