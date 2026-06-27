// ============================================================
// FORMAT — Utilidades de formateo
// ============================================================

/**
 * Formatea un ID de partido con ceros a la izquierda (1 → "01")
 */
export function padId(id) {
  return String(id).padStart(2, '0');
}

/**
 * Formatea una fecha ISO a formato local español
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es');
}

/**
 * Calcula los puntos de una predicción contra el resultado real
 * @returns {number} 5 = exacto, 3 = resultado correcto, 0 = fallo
 */
export function calcPoints(pred, match) {
  if (match.home_result === null || match.away_result === null) return 0;
  if (!pred) return 0;
  if (pred.home_goals === match.home_result && pred.away_goals === match.away_result) return 5;
  if (Math.sign(pred.home_goals - pred.away_goals) === Math.sign(match.home_result - match.away_result)) return 3;
  return 0;
}
