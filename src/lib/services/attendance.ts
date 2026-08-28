import type { Attendance } from "../storage";
import { requestD1 } from "./d1Client";

export async function fetchAttendance(classroomId: string): Promise<Attendance[]> {
  const data = await requestD1<any[]>(`/api/attendance?classroom_id=${classroomId}`);

  // Group by date to reconstruct the local Attendance schema
  const grouped: Record<string, Attendance> = {};

  (data || []).forEach((row: any) => {
    const dateStr = row.date; // YYYY-MM-DD
    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        id: `att_${classroomId}_${dateStr}`,
        classroom_id: classroomId,
        fecha: dateStr,
        registro: {},
        tipo_dia: (row.notes === "feriado" || row.notes === "grupo_pedagogico" || row.notes === "regular")
          ? row.notes as any
          : "regular"
      };
    }
    // Map justified 'J' back to excused 'E' for the local UI representation
    const status = row.status === "J" ? "E" : row.status;
    grouped[dateStr].registro[row.student_id] = status;
  });

  return Object.values(grouped);
}

export async function saveAttendance(a: Attendance): Promise<void> {
  // If tipo_dia is feriado or grupo_pedagogico, or if we have an empty register but it's a day,
  // we want to ensure we save rows for all students in that classroom so the day type is saved.
  let studentIds = Object.keys(a.registro);
  const isSpecialDay = a.tipo_dia === "feriado" || a.tipo_dia === "grupo_pedagogico";

  if (studentIds.length === 0 || isSpecialDay) {
    const studentsData = await requestD1<any[]>(`/api/students?classroom_id=${a.classroom_id}`);

    if (studentsData && studentsData.length > 0) {
      studentIds = studentsData.map((s: any) => s.id);
    }
  }

  if (studentIds.length === 0) return;

  const upserts = studentIds.map((studentId) => {
    let dbStatus = "P";
    if (isSpecialDay) {
      // Both feriado and grupo_pedagogico are non-teaching days, so we store 'F'
      // which is allowed by the database constraint.
      dbStatus = "F";
    } else {
      const status = a.registro[studentId] || "P";
      dbStatus = status === "E" ? "J" : status;
    }

    return {
      id: `att_${studentId}_${a.fecha}`,
      student_id: studentId,
      classroom_id: a.classroom_id,
      date: a.fecha,
      status: dbStatus,
      notes: a.tipo_dia || "regular"
    };
  });

  await requestD1<any>("/api/attendance", "POST", upserts);
}

export async function deleteAttendanceRecord(classroomId: string, date: string): Promise<void> {
  await requestD1<any>(`/api/attendance?classroom_id=${classroomId}&date=${date}`, "DELETE");
}
