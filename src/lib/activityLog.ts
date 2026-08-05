export type LocalActivity = {
  id: string;
  kind: 'tool' | 'workshop';
  userName: string;
  title: string;
  detail?: string;
  date: string;
};

import { supabase } from './supabase';
import { getCurrentUser } from './storage';

export async function logActivity(activity: Omit<LocalActivity, 'id' | 'date'>) {
  const newEntry: LocalActivity = {
    id: crypto.randomUUID(),
    kind: activity.kind,
    userName: activity.userName,
    title: activity.title,
    detail: activity.detail,
    date: new Date().toISOString(),
  };

  // Local storage backup for immediate local updates
  try {
    const existingStr = localStorage.getItem('plx:activity_log');
    const existing: LocalActivity[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [newEntry, ...existing].slice(0, 50);
    localStorage.setItem('plx:activity_log', JSON.stringify(updated));
  } catch (_) {}

  // Remote Supabase Persistence
  try {
    let userObj = getCurrentUser();
    if (!userObj) {
      try {
        const stored = localStorage.getItem('plx:user');
        if (stored) userObj = JSON.parse(stored);
      } catch (_) {}
    }
    
    const userId = userObj?.id;
    if (userId) {
      await supabase.from('activity_log').insert({
        id: newEntry.id,
        user_id: userId,
        kind: activity.kind,
        title: activity.title,
        detail: activity.detail || null,
        user_name: activity.userName,
        created_at: newEntry.date,
      });
    }
  } catch (err) {
    console.warn('Could not log activity to Supabase:', err);
  }

  window.dispatchEvent(new CustomEvent('plx:activity-updated'));
}

export function getLocalActivities(): LocalActivity[] {
  try {
    const stored = localStorage.getItem('plx:activity_log');
    return stored ? JSON.parse(stored) : [];
  } catch (_) {
    return [];
  }
}
