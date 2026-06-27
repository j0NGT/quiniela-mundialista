// ============================================================
// MATCHES SERVICE — CRUD de partidos
// ============================================================
import { getSupabase } from '../core/api.js';
import { state } from '../core/state.js';

/**
 * Carga todos los partidos ordenados por ID
 */
export async function fetchMatches() {
  var sb = getSupabase();
  var { data, error } = await sb.from('matches').select('*').order('id');
  if (error) throw error;
  state.MATCHES = data;
  return data;
}

/**
 * Actualiza los nombres de equipos de todos los partidos
 */
export async function updateTeams(teams) {
  var sb = getSupabase();
  for (var i = 0; i < teams.length; i++) {
    await sb.from('matches').update({
      home_team: teams[i].home_team,
      away_team: teams[i].away_team
    }).eq('id', teams[i].id);
  }
  return await fetchMatches();
}

/**
 * Actualiza el resultado de un partido
 */
export async function updateResult(matchId, homeResult, awayResult) {
  var sb = getSupabase();
  await sb.from('matches').update({
    home_result: homeResult,
    away_result: awayResult
  }).eq('id', matchId);
  return await fetchMatches();
}

/**
 * Limpia el resultado de un partido
 */
export async function clearResult(matchId) {
  var sb = getSupabase();
  await sb.from('matches').update({
    home_result: null,
    away_result: null
  }).eq('id', matchId);
  state.ALL_PREDICTIONS = [];
  return await fetchMatches();
}

/**
 * Limpia todos los resultados
 */
export async function clearAllResults() {
  var sb = getSupabase();
  await sb.from('matches').update({ home_result: null, away_result: null });
  state.ALL_PREDICTIONS = [];
  return await fetchMatches();
}
