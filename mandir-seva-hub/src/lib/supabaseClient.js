// src/lib/supabaseClient.js
// ─────────────────────────────────────────────────────────────
// Replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with
// your actual values from: Supabase Dashboard → Settings → API
// Add them to your .env file:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGci...
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://YOUR_PROJECT.supabase.co';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 10 } },
  auth:     { persistSession: false },         // no auth needed
});

// ─── Table helpers ────────────────────────────────────────────
export const TEMPLES_TABLE = 'temples_data';

/** Fetch all events (frontend handles expiry filtering) */
export async function fetchTemples() {
  const { data, error } = await supabase
    .from(TEMPLES_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Insert a new temple event */
export async function insertTemple(payload) {
  const { data, error } = await supabase
    .from(TEMPLES_TABLE)
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Increment likes — anonymous, uses DB-side increment */
export async function incrementLikes(id, currentLikes) {
  const { error } = await supabase
    .from(TEMPLES_TABLE)
    .update({ likes: currentLikes + 1 })
    .eq('id', id);
  if (error) throw error;
}

/** Increment reports — triggers DB function to set status:'pending' if >= 5 */
export async function incrementReports(id, currentReports) {
  const newReports = currentReports + 1;
  const update = { reports: newReports };
  if (newReports >= 5) update.status = 'pending';
  const { error } = await supabase
    .from(TEMPLES_TABLE)
    .update(update)
    .eq('id', id);
  if (error) throw error;
}

/** Subscribe to real-time changes */
export function subscribeToTemples(callback) {
  return supabase
    .channel('temples_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: TEMPLES_TABLE }, callback)
    .subscribe();
}
