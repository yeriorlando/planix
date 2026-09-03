import type { AttendanceIncident } from "../storage";
import { requestD1 } from "./d1Client";

export async function fetchAttendanceIncidents(classroomId?: string, date?: string): Promise<AttendanceIncident[]> {
  const params = new URLSearchParams();
  if (classroomId) params.set("classroom_id", classroomId);
  if (date) params.set("date", date);

  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await requestD1<any[]>(`/api/attendance-incidents${query}`);

  return (data || []).map((row: any) => ({
    id: row.id,
    classroom_id: row.classroom_id,
    teacher_id: row.teacher_id,
    fecha: row.date || row.fecha,
    tipo: row.type || row.tipo || "salida_anticipada",
    titulo: row.title || row.titulo || "Incidencia de asistencia",
    descripcion: row.description || row.descripcion || "",
    hora_salida: row.departure_time || row.hora_salida || undefined,
    afecto_asistencia: row.affected_attendance !== 0,
    creado_en: row.created_at || row.creado_en || new Date().toISOString(),
    actualizado_en: row.updated_at || row.actualizado_en
  }));
}

export async function saveAttendanceIncident(inc: AttendanceIncident): Promise<void> {
  const payload = {
    id: inc.id,
    classroom_id: inc.classroom_id,
    teacher_id: inc.teacher_id,
    date: inc.fecha,
    type: inc.tipo,
    title: inc.titulo,
    description: inc.descripcion,
    departure_time: inc.hora_salida || null,
    affected_attendance: inc.afecto_asistencia ? 1 : 0,
    created_at: inc.creado_en,
    updated_at: new Date().toISOString()
  };

  await requestD1<any>("/api/attendance-incidents", "POST", payload);
}

export async function deleteAttendanceIncident(id: string): Promise<void> {
  await requestD1<any>(`/api/attendance-incidents/${id}`, "DELETE");
}
