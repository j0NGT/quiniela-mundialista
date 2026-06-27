// ============================================================
// CARD — Componente de tarjeta de partido
// ============================================================
import { esc, ea } from '../../utils/dom.js';
import { padId, calcPoints } from '../../utils/format.js';

/**
 * Genera el HTML de una tarjeta de predicción de partido
 */
export function buildMatchCard(match, prediction, locked) {
  var m = match;
  var pr = prediction;
  var ph = pr ? pr.home_goals : '';
  var pa = pr ? pr.away_goals : '';
  var hr = m.home_result !== null && m.away_result !== null;
  var pts = calcPoints(pr, m);

  var rh = '';
  if (hr) {
    var pb = pts === 5
      ? '<span class="inline-flex items-center gap-1 text-gold text-xs font-bold"><i class="fas fa-star"></i> +5</span>'
      : pts === 3
        ? '<span class="inline-flex items-center gap-1 text-success text-xs font-bold"><i class="fas fa-check"></i> +3</span>'
        : '<span class="inline-flex items-center gap-1 text-danger/60 text-xs"><i class="fas fa-xmark"></i> 0</span>';
    rh = '<div class="mt-3 pt-3 border-t border-border flex items-center justify-between">' +
      '<span class="text-xs text-muted">Resultado: <span class="font-display text-base font-bold text-txt">' + m.home_result + ' - ' + m.away_result + '</span></span>' + pb + '</div>';
  }

  return '<div class="match-card' + (hr ? ' has-result' : '') + '">' +
    '<div class="flex items-center justify-between mb-4">' +
    '<span class="text-xs font-bold text-muted font-display tracking-wider">PARTIDO ' + padId(m.id) + '</span>' +
    (locked ? '<i class="fas fa-lock text-muted/30 text-xs"></i>' : '') +
    '</div>' +
    '<div class="flex items-center justify-between gap-3">' +
    '<div class="flex-1 text-right"><p class="font-display text-base sm:text-lg font-semibold text-txt truncate">' + esc(m.home_team) + '</p></div>' +
    '<div class="flex items-center gap-2">' +
    '<input type="number" min="0" max="99" class="goal-input" id="ph-' + m.id + '" value="' + ea(ph) + '" ' + (locked ? 'disabled' : '') + '>' +
    '<span class="text-muted text-xs font-bold">-</span>' +
    '<input type="number" min="0" max="99" class="goal-input" id="pa-' + m.id + '" value="' + ea(pa) + '" ' + (locked ? 'disabled' : '') + '>' +
    '</div>' +
    '<div class="flex-1"><p class="font-display text-base sm:text-lg font-semibold text-txt truncate">' + esc(m.away_team) + '</p></div>' +
    '</div>' + rh + '</div>';
}

/**
 * Genera el HTML del resumen de rendimiento
 */
export function buildPerformanceSummary(matches, predMap) {
  var t = 0, ex = 0, ac = 0, fa = 0;
  matches.forEach(function(m) {
    var pts = calcPoints(predMap[m.id], m);
    t += pts;
    if (pts === 5) ex++;
    else if (pts === 3) ac++;
    else if (predMap[m.id]) fa++;
  });
  var mx = matches.length * 5;
  var pc = Math.round((t / mx) * 100);

  return '<div class="mt-6 bg-card border border-border rounded-xl p-5">' +
    '<div class="flex items-center justify-between mb-3">' +
    '<span class="font-display text-lg font-bold text-txt">Mi Rendimiento</span>' +
    '<span class="font-display text-2xl font-bold text-gold">' + t +
    '<span class="text-sm text-muted font-body font-normal"> / ' + mx + '</span></span>' +
    '</div>' +
    '<div class="pts-bar mb-3"><div class="pts-bar-fill" style="width:' + pc + '%"></div></div>' +
    '<div class="flex gap-6 text-sm">' +
    '<span class="text-gold"><i class="fas fa-star mr-1"></i>' + ex + ' exactos</span>' +
    '<span class="text-success"><i class="fas fa-check mr-1"></i>' + ac + ' aciertos</span>' +
    '<span class="text-danger/60"><i class="fas fa-xmark mr-1"></i>' + fa + ' fallidos</span>' +
    '</div></div>';
}
