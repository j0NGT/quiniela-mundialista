// ============================================================
// LEADERBOARD VIEW — Renderizado de clasificación y detalles
// ============================================================
import { state } from '../../core/state.js';
import { esc } from '../../utils/dom.js';
import { calcPoints } from '../../utils/format.js';
import { kpiCard, buildMatrixCell, buildMatrixLegend } from '../../ui/components/table.js';

/**
 * Genera el HTML de la tabla de posiciones
 */
export function renderStandingsView(results, matchesPlayed) {
  var n = results.length;
  var mx = state.MATCHES.length * 5;

  var h = '<div class="flex flex-wrap items-end justify-between gap-3 mb-6"><div>' +
    '<h2 class="font-display text-2xl font-bold text-txt">Tabla de Posiciones</h2>' +
    '<p class="text-muted text-sm mt-0.5">' + n + ' jugadores' +
    (matchesPlayed > 0 ? ' — ' + matchesPlayed + '/' + state.MATCHES.length + ' jugados' : ' — Sin resultados') +
    '</p></div></div>';

  if (n > 0) {
    var ld = results[0];
    var av = (results.reduce(function(s, p) { return s + p.t; }, 0) / n).toFixed(1);
    h += '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">';
    h += kpiCard('fa-crown', 'Lider', ld.name, 'text-gold', 'bg-gold/8', 'border-gold/15');
    h += kpiCard('fa-star', 'Max Puntos', ld.t, 'text-gold', 'bg-gold/8', 'border-gold/15');
    h += kpiCard('fa-chart-line', 'Promedio', av, 'text-info', 'bg-info/8', 'border-info/15');
    h += kpiCard('fa-futbol', 'Jugados', matchesPlayed + '/' + state.MATCHES.length, 'text-success', 'bg-success/8', 'border-success/15');
    h += '</div>';
  }

  if (n === 0) {
    return h + '<div class="text-center py-16 text-muted"><i class="fas fa-users text-4xl mb-4 opacity-30"></i><p>Sin jugadores</p></div>';
  }

  // Tabla principal
  h += '<div class="bg-card border border-border rounded-xl overflow-hidden mb-6"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-border text-left">' +
    '<th class="px-4 py-3 text-muted font-semibold text-xs w-12">#</th>' +
    '<th class="px-4 py-3 text-muted font-semibold text-xs">Jugador</th>' +
    '<th class="px-4 py-3 text-muted font-semibold text-xs text-center">PTS</th>' +
    '<th class="px-4 py-3 text-muted font-semibold text-xs text-center hidden sm:table-cell"><i class="fas fa-star text-gold/50"></i></th>' +
    '<th class="px-4 py-3 text-muted font-semibold text-xs text-center hidden sm:table-cell"><i class="fas fa-check text-success/50"></i></th>' +
    '<th class="px-4 py-3 text-muted font-semibold text-xs text-center hidden md:table-cell"><i class="fas fa-xmark text-danger/40"></i></th>' +
    '<th class="px-4 py-3 text-muted font-semibold text-xs hidden lg:table-cell" style="min-width:120px">Progreso</th>' +
    '</tr></thead><tbody>';

  results.forEach(function(p, i) {
    var rk = i + 1;
    var pc = mx > 0 ? Math.round((p.t / mx) * 100) : 0;
    var md = '';

    if (rk === 1) md = '<span class="medal medal-gold"><i class="fas fa-trophy"></i></span>';
    else if (rk === 2) md = '<span class="medal medal-silver"><i class="fas fa-medal"></i></span>';
    else if (rk === 3) md = '<span class="medal medal-bronze"><i class="fas fa-medal"></i></span>';
    else md = '<span class="text-muted text-sm">' + rk + '</span>';

    var me = p.name === state.ME.name;
    h += '<tr class="border-b border-border/50 hover:bg-white/[0.02]' + (me ? ' bg-gold/[0.04]' : '') + '">' +
      '<td class="px-4 py-3 text-center">' + md + '</td>' +
      '<td class="px-4 py-3 font-semibold' + (me ? ' text-gold' : ' text-txt') + '">' + esc(p.name) + (me ? ' <span class="text-xs text-gold/50 font-normal">(tu)</span>' : '') + '</td>' +
      '<td class="px-4 py-3 text-center"><span class="font-display text-xl font-bold text-txt">' + p.t + '</span></td>' +
      '<td class="px-4 py-3 text-center hidden sm:table-cell"><span class="text-gold font-semibold">' + p.ex + '</span></td>' +
      '<td class="px-4 py-3 text-center hidden sm:table-cell"><span class="text-success font-semibold">' + p.ac + '</span></td>' +
      '<td class="px-4 py-3 text-center hidden md:table-cell"><span class="text-danger/50">' + p.fa + '</span></td>' +
      '<td class="px-4 py-3 hidden lg:table-cell"><div class="pts-bar"><div class="pts-bar-fill" style="width:' + pc + '%"></div></div></td>' +
      '</tr>';
  });
  h += '</tbody></table></div></div>';

  // Matriz de puntos
  if (matchesPlayed > 0) {
    h += '<div class="bg-card border border-border rounded-xl p-4 sm:p-5 overflow-x-auto">' +
      '<h3 class="font-display text-lg font-bold text-txt mb-4">Matriz de Puntos</h3>' +
      '<table class="w-full text-xs"><thead><tr class="border-b border-border">' +
      '<th class="px-2 py-2 text-left text-muted font-semibold min-w-[100px]">Jugador</th>';

    state.MATCHES.forEach(function(m) {
      h += '<th class="px-1 py-2 text-center text-muted font-semibold w-9">P' + m.id + '</th>';
    });
    h += '<th class="px-2 py-2 text-center text-muted font-bold">TOTAL</th></tr></thead><tbody>';

    results.forEach(function(p) {
      var me = p.name === state.ME.name;
      h += '<tr class="border-b border-border/30' + (me ? ' bg-gold/[0.04]' : '') + '">' +
        '<td class="px-2 py-1.5 font-semibold truncate max-w-[120px]' + (me ? ' text-gold' : ' text-txt') + '">' + esc(p.name) + '</td>';
      p.pm.forEach(function(pts) {
        h += buildMatrixCell(pts);
      });
      h += '<td class="px-2 py-1.5 text-center font-display font-bold text-lg text-txt">' + p.t + '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += buildMatrixLegend();
  }

  return h;
}

/**
 * Genera el HTML del detalle por partido
 */
export function renderDetailsView(match, playerPredictions, hasResult) {
  var m = match;

  var h = '<div class="bg-card border border-border rounded-xl p-5 mb-6">' +
    '<div class="flex items-center justify-between gap-4">' +
    '<div class="flex-1 text-right"><p class="font-display text-xl sm:text-2xl font-bold text-txt">' + esc(m.home_team) + '</p></div>' +
    '<div class="text-center"><p class="font-display text-3xl font-bold text-muted">VS</p>' +
    (hasResult
      ? '<p class="font-display text-lg font-bold text-success mt-1">' + m.home_result + ' - ' + m.away_result + '</p>'
      : '<p class="text-xs text-muted mt-1">Sin resultado</p>') +
    '</div>' +
    '<div class="flex-1"><p class="font-display text-xl sm:text-2xl font-bold text-txt">' + esc(m.away_team) + '</p></div>' +
    '</div></div>';

  if (!playerPredictions.length) {
    return h + '<div class="text-center py-12 text-muted"><i class="fas fa-users text-3xl mb-3 opacity-30"></i><p>Sin jugadores</p></div>';
  }

  h += '<div class="bg-card border border-border rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead>' +
    '<tr class="border-b border-border">' +
    '<th class="px-4 py-3 text-left text-muted font-semibold text-xs w-12">#</th>' +
    '<th class="px-4 py-3 text-left text-muted font-semibold text-xs">Jugador</th>' +
    '<th class="px-4 py-3 text-center text-muted font-semibold text-xs">Prediccion</th>' +
    (hasResult ? '<th class="px-4 py-3 text-center text-muted font-semibold text-xs">Pts</th><th class="px-4 py-3 text-center text-muted font-semibold text-xs">Estado</th>' : '') +
    '</tr></thead><tbody>';

  playerPredictions.forEach(function(mp, i) {
    var me = mp.nm === state.ME.name;
    var pt = mp.pr ? (mp.pr.home_goals + ' - ' + mp.pr.away_goals) : 'Sin prediccion';

    var ph = '';
    if (hasResult) {
      ph = '<td class="px-4 py-3 text-center font-display font-bold text-lg ' +
        (mp.pts === 5 ? 'text-gold' : mp.pts === 3 ? 'text-success' : 'text-muted/40') + '">' + mp.pts + '</td>';
    }

    var sh = '';
    if (hasResult) {
      if (mp.pts === 5) sh = '<td class="px-4 py-3 text-center"><span class="inline-flex items-center gap-1 text-gold text-xs font-bold"><i class="fas fa-star"></i> Exacto</span></td>';
      else if (mp.pts === 3) sh = '<td class="px-4 py-3 text-center"><span class="inline-flex items-center gap-1 text-success text-xs font-bold"><i class="fas fa-check"></i> Acierto</span></td>';
      else sh = '<td class="px-4 py-3 text-center"><span class="inline-flex items-center gap-1 text-danger/40 text-xs"><i class="fas fa-xmark"></i> Fallido</span></td>';
    }

    h += '<tr class="border-b border-border/30' + (me ? ' bg-gold/[0.04]' : '') + '">' +
      '<td class="px-4 py-3 text-center text-muted">' + (i + 1) + '</td>' +
      '<td class="px-4 py-3 font-semibold' + (me ? ' text-gold' : ' text-txt') + '">' + esc(mp.nm) + (me ? ' <span class="text-xs text-gold/50 font-normal">(tu)</span>' : '') + '</td>' +
      '<td class="px-4 py-3 text-center font-display text-base font-semibold text-txt">' + pt + '</td>' +
      ph + sh + '</tr>';
  });

  h += '</tbody></table></div></div>';
  return h;
}
