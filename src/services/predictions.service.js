// ============================================================
// PREDICTIONS SERVICE — CRUD de predicciones
// ============================================================
import { getSupabase } from '../core/api.js';
import { state } from '../core/state.js';

/**
 * Carga las predicciones del jugador actual
 */
export async function fetchMyPredictions() {
  var sb = getSupabase();
  var { data, error } = await sb.from('predictions').select('*').eq('player_id', state.ME.id);
  if (error) throw error;
  return data || [];
}

/**
 * Carga todas las predicciones (para standings/detalles)
 */
export async function fetchAllPredictions() {
  var sb = getSupabase();
  var { data, error } = await sb.from('predictions').select('*');
  if (error) throw error;
  state.ALL_PREDICTIONS = data || [];
  return state.ALL_PREDICTIONS;
}

/**
 * Guarda las predicciones del jugador actual
 * (borra las anteriores y las reinserta)
 */
export async function savePredictions(rows) {
  var sb = getSupabase();
  await sb.from('predictions').delete().eq('player_id', state.ME.id);
  var { error } = await sb.from('predictions').insert(rows);
  if (error) throw error;
}

/**
 * Elimina TODAS las predicciones (acción admin)
 */
export async function deleteAllPredictions() {
  var sb = getSupabase();
  await sb.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  state.ALL_PREDICTIONS = [];
}
