// ============================================================
// ADMIN SERVICE — Configuración y gestión administrativa
// ============================================================
import { getSupabase } from '../core/api.js';
import { state } from '../core/state.js';
import { sha256 } from '../core/auth.js';

/**
 * Carga la configuración (settings)
 */
export async function fetchSettings() {
  var sb = getSupabase();
  var { data, error } = await sb.from('settings').select('*').single();
  if (error) throw error;
  state.SETS = data;
  return data;
}

/**
 * Alterna el bloqueo de predicciones
 */
export async function toggleLock() {
  var sb = getSupabase();
  var newLocked = !state.SETS.locked;
  await sb.from('settings').update({ locked: newLocked }).eq('id', 1);
  state.SETS.locked = newLocked;
  return newLocked;
}

/**
 * Cambia el PIN de administrador
 */
export async function changeAdminPin(newPin) {
  var sb = getSupabase();
  var hash = await sha256(newPin);
  await sb.from('settings').update({ admin_pin_hash: hash }).eq('id', 1);
  state.SETS.admin_pin_hash = hash;
}

/**
 * Carga la lista de jugadores
 */
export async function fetchPlayers() {
  var sb = getSupabase();
  var { data, error } = await sb.from('players').select('*').order('name');
  if (error) throw error;
  state.ALL_PLAYERS = data || [];
  return state.ALL_PLAYERS;
}
