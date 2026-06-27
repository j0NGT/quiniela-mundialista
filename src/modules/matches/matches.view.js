// ============================================================
// MATCHES VIEW — Renderizado de predicciones
// ============================================================
import { state } from '../../core/state.js';
import { buildMatchCard, buildPerformanceSummary } from '../../ui/components/card.js';

/**
 * Genera el HTML completo de la sección de predicciones
 */
export function renderPredictionsView(predMap) {
  var lk = state.SETS.locked;
  var hasR = state.MATCHES.some(function(m) { return m.home_result !== null; });

  var st = lk
    ? '<span class="status-badge status-locked"><i class="fas fa-lock text-[10px]"></i> Cerrado</span>'
    : '<span class="status-badge status-open"><i class="fas fa-lock-open text-[10px]"></i> Abierto</span>';

  var h = '<div class="flex flex-wrap items-center justify-between gap-3 mb-6"><div>' +
    '<h2 class="font-display text-2xl font-bold text-txt">Mis Predicciones</h2>' +
    '<p class="text-muted text-sm mt-0.5">Octavos de Final — ' + st + '</p></div>';

  if (!lk) {
    h += '<button class="btn-gold text-sm" onclick="savePred()"><i class="fas fa-save mr-2"></i>Guardar</button>';
  }
  h += '</div>';

  if (lk) {
    h += '<div class="bg-danger/8 border border-danger/20 rounded-xl p-3 mb-5 text-sm text-danger/80 flex items-center gap-2" style="animation:sd .3s ease">' +
      '<i class="fas fa-info-circle"></i>Las predicciones estan cerradas.</div>';
  }

  h += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  state.MATCHES.forEach(function(m) {
    h += buildMatchCard(m, predMap[m.id], lk);
  });
  h += '</div>';

  if (hasR) {
    h += buildPerformanceSummary(state.MATCHES, predMap);
  }

  return h;
}
