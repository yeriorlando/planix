import { requestD1 } from "./d1Client";

export interface TeacherEvent {
  id: string;
  teacher_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type?: string;
  duration?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchEvents(teacherId: string): Promise<TeacherEvent[]> {
  return await requestD1<TeacherEvent[]>(`/api/events?teacher_id=${teacherId}`);
}

export async function saveEvent(event: TeacherEvent): Promise<void> {
  await requestD1<void>("/api/events", "POST", event);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await requestD1<void>(`/api/events/${eventId}`, "DELETE");
}
