// ============================================================
// LEADERBOARD CONTROLLER — Orquestación de clasificación
// ============================================================
import { state } from '../../core/state.js';
import { calcPoints } from '../../utils/format.js';
import { fetchPlayers } from '../../services/admin.service.js';
import { fetchAllPredictions } from '../../services/predictions.service.js';
import { renderStandingsView, renderDetailsView } from './leaderboard.view.js';

/**
 * Renderiza la pantalla de clasificación
 */
export async function renderStandings() {
  var c = document.getElementById('standings-content');
  c.innerHTML = '<div class="text-center py-16"><span class="spinner"></span></div>';

  try {
    var players = await fetchPlayers();
    await fetchAllPredictions();

    var matchesPlayed = state.MATCHES.filter(function(m) { return m.home_result !== null; }).length;

    var results = state.ALL_PLAYERS.map(function(pl) {
      var plP = state.ALL_PREDICTIONS.filter(function(p) { return p.player_id === pl.id; });
      var pm2 = {};
      plP.forEach(function(p) { pm2[p.match_id] = p; });

      var t = 0, ex = 0, ac = 0, fa = 0, pm = [];
      state.MATCHES.forEach(function(m) {
        var pts = calcPoints(pm2[m.id], m);
        t += pts;
        pm.push(pts);
        if (pts === 5) ex++;
        else if (pts === 3) ac++;
        else if (pm2[m.id]) fa++;
      });

      return { name: pl.name, t: t, ex: ex, ac: ac, fa: fa, pm: pm };
    }).sort(function(a, b) {
      return b.t - a.t || b.ex - a.ex || b.ac - a.ac;
    });

    c.innerHTML = renderStandingsView(results, matchesPlayed);
  } catch (e) {
    c.innerHTML = '<p class="text-danger text-center py-8">Error al cargar</p>';
    console.error(e);
  }
}

/**
 * Renderiza la pantalla de detalle por partido
 */
export async function renderDetails() {
  var c = document.getElementById('details-content');
  c.innerHTML = '<div class="text-center py-16"><span class="spinner"></span></div>';

  try {
    if (!state.ALL_PLAYERS.length) await fetchPlayers();
    if (!state.ALL_PREDICTIONS.length) await fetchAllPredictions();

    // Tabs de selección de partido
    var h = '<div class="mb-6"><h2 class="font-display text-2xl font-bold text-txt">Detalle por Partido</h2>' +
      '<p class="text-muted text-sm mt-0.5">Comparacion de predicciones</p></div>' +
      '<div class="flex gap-2 mb-6 overflow-x-auto pb-2">';

    state.MATCHES.forEach(function(m) {
      var ac = m.id === state.DET_MATCH;
      h += '<button onclick="setDetailMatch(' + m.id + ')" class="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ' +
        (ac ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-card border border-border text-muted hover:text-txt hover:border-gold/20') +
        '">P' + String(m.id).padStart(2, '0') + '</button>';
    });
    h += '</div>';

    var m = state.MATCHES.find(function(x) { return x.id === state.DET_MATCH; });
    if (!m) { c.innerHTML = h; return; }

    var hasR = m.home_result !== null && m.away_result !== null;

    var mpl = state.ALL_PLAYERS.map(function(pl) {
      var pr = state.ALL_PREDICTIONS.find(function(p) {
        return p.player_id === pl.id && p.match_id === m.id;
      });
      return { nm: pl.name, pr: pr, pts: calcPoints(pr, m) };
    }).sort(function(a, b) { return b.pts - a.pts; });

    h += renderDetailsView(m, mpl, hasR);
    c.innerHTML = h;
  } catch (e) {
    c.innerHTML = '<p class="text-danger text-center py-8">Error</p>';
    console.error(e);
  }
}

/**
 * Cambia el partido seleccionado en detalle y re-renderiza
 */
export function setDetailMatch(id) {
  state.DET_MATCH = id;
  renderDetails();
}
