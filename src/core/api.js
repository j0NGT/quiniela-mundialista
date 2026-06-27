// ============================================================
// API — Cliente Supabase centralizado
// ============================================================
import { SB_URL, SB_KEY } from '../config.js';
import { state } from './state.js';

/**
 * Inicializa el cliente Supabase y lo almacena en el estado global
 */
export function initSupabase() {
  state.sb = window.supabase.createClient(SB_URL, SB_KEY);
  return state.sb;
}

/**
 * Retorna el cliente Supabase
 */
export function getSupabase() {
  return state.sb;
}
