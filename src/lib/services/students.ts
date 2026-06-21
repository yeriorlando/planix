import type { Student } from "../storage";
import { requestD1 } from "./d1Client";

export function mapStudentFromDb(row: any, index: number): Student {
  return {
    id: row.id,
    classroom_id: row.classroom_id,
    nombre: row.first_name,
    apellido: row.last_name || "",
    rne_matricula: row.student_id_number || "",
    numero_orden: row.order_number !== null && row.order_number !== undefined ? row.order_number : (index + 1),
    genero: row.gender === "F" ? "F" : "M",
    direccion: row.address || "",
    avatar_url: row.avatar_url || "",
    creado_en: row.created_at || new Date().toISOString(),
  };
}

export function mapStudentToDb(s: Student) {
  return {
    id: s.id,
    classroom_id: s.classroom_id,
    first_name: s.nombre,
    last_name: s.apellido || "",
    student_id_number: s.rne_matricula || "",
    order_number: s.numero_orden,
    gender: s.genero,
    address: s.direccion || "",
    avatar_url: s.avatar_url || "",
    created_at: s.creado_en,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchStudents(classroomId: string): Promise<Student[]> {
  const data = await requestD1<any[]>(`/api/students?classroom_id=${classroomId}`);

  // Sort by order_number if present, otherwise fallback to alphabetical order
  const sorted = (data || []).sort((a: any, b: any) => {
    if (a.order_number !== null && a.order_number !== undefined && b.order_number !== null && b.order_number !== undefined) {
      return a.order_number - b.order_number;
    }
    const nameA = `${a.last_name || ""} ${a.first_name || ""}`.toLowerCase().trim();
    const nameB = `${b.last_name || ""} ${b.first_name || ""}`.toLowerCase().trim();
    return nameA.localeCompare(nameB);
  });

  return sorted.map((row, idx) => mapStudentFromDb(row, idx));
}

export async function saveStudent(s: Student): Promise<Student> {
  const dbRow = mapStudentToDb(s);
  await requestD1<any>("/api/students", "POST", dbRow);
  return s;
}

export async function deleteStudent(id: string): Promise<void> {
  await requestD1<any>(`/api/students/${id}`, "DELETE");
}
