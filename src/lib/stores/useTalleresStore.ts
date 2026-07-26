// Store de persistencia para talleres educativos
import { requestD1 } from '../services/d1Client';
import type { Workshop, WorkshopSession, WorkshopType } from '../../types/tallerTypes';

// ────── Read ──────
export async function getTalleres(docenteId: string): Promise<Workshop[]> {
  try {
    return await requestD1<Workshop[]>(`/api/talleres?docente_id=${encodeURIComponent(docenteId)}`);
  } catch (err) {
    console.error("Error in getTalleres:", err);
    return [];
  }
}

export async function getTallerById(id: string): Promise<Workshop | null> {
  try {
    return await requestD1<Workshop>(`/api/talleres/${encodeURIComponent(id)}`);
  } catch (err) {
    console.error("Error in getTallerById:", err);
    return null;
  }
}

// ────── Write ──────
export async function saveTaller(taller: Omit<Workshop, 'id' | 'sesiones' | 'creado_en' | 'actualizado_en'>): Promise<Workshop> {
  try {
    return await requestD1<Workshop>('/api/talleres', 'POST', taller);
  } catch (err) {
    console.error("Error in saveTaller:", err);
    throw err;
  }
}

export async function updateTaller(id: string, updates: Partial<Workshop>): Promise<Workshop | null> {
  try {
    return await requestD1<Workshop>(`/api/talleres/${encodeURIComponent(id)}`, 'PUT', updates);
  } catch (err) {
    console.error("Error in updateTaller:", err);
    return null;
  }
}

export async function deleteTaller(id: string): Promise<boolean> {
  try {
    const res = await requestD1<{ success: boolean }>(`/api/talleres/${encodeURIComponent(id)}`, 'DELETE');
    return !!res?.success;
  } catch (err) {
    console.error("Error in deleteTaller:", err);
    return false;
  }
}

// ────── Sessions ──────
export async function addSession(
  tallerId: string,
  session: Omit<WorkshopSession, 'id' | 'taller_id' | 'numero_clase' | 'creado_en'>
): Promise<WorkshopSession | null> {
  try {
    return await requestD1<WorkshopSession>(`/api/talleres/${encodeURIComponent(tallerId)}/sesiones`, 'POST', session);
  } catch (err) {
    console.error("Error in addSession:", err);
    return null;
  }
}

export async function updateSession(
  tallerId: string,
  sessionId: string,
  updates: Partial<WorkshopSession>
): Promise<WorkshopSession | null> {
  try {
    return await requestD1<WorkshopSession>(
      `/api/talleres/${encodeURIComponent(tallerId)}/sesiones/${encodeURIComponent(sessionId)}`,
      'PUT',
      updates
    );
  } catch (err) {
    console.error("Error in updateSession:", err);
    return null;
  }
}

export async function deleteSession(tallerId: string, sessionId: string): Promise<boolean> {
  try {
    const res = await requestD1<{ success: boolean }>(
      `/api/talleres/${encodeURIComponent(tallerId)}/sesiones/${encodeURIComponent(sessionId)}`,
      'DELETE'
    );
    return !!res?.success;
  } catch (err) {
    console.error("Error in deleteSession:", err);
    return false;
  }
}

export async function getSession(tallerId: string, sessionId: string): Promise<WorkshopSession | null> {
  try {
    return await requestD1<WorkshopSession>(
      `/api/talleres/${encodeURIComponent(tallerId)}/sesiones/${encodeURIComponent(sessionId)}`
    );
  } catch (err) {
    console.error("Error in getSession:", err);
    return null;
  }
}

// ────── Stats ──────
export function getTallerProgress(taller: Workshop): { completadas: number; total: number; porcentaje: number } {
  if (!taller || !taller.sesiones) return { completadas: 0, total: 0, porcentaje: 0 };
  const completadas = taller.sesiones.filter(s => s.estado === 'completada').length;
  const total = taller.sesiones.length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
  return { completadas, total, porcentaje };
}
