// ============================================================
// MATCHES CONTROLLER — Lógica de predicciones
// ============================================================
import { state } from '../../core/state.js';
import { toast } from '../../ui/layout.js';
import { fetchMyPredictions, savePredictions } from '../../services/predictions.service.js';
import { renderPredictionsView } from './matches.view.js';

/**
 * Renderiza la pantalla de predicciones
 */
export async function renderPredictions() {
  var c = document.getElementById('predictions-content');
  c.innerHTML = '<div class="text-center py-16"><span class="spinner"></span></div>';

  try {
    var preds = await fetchMyPredictions();
    var predMap = {};
    preds.forEach(function(p) { predMap[p.match_id] = p; });
    c.innerHTML = renderPredictionsView(predMap);
  } catch (e) {
    c.innerHTML = '<p class="text-danger text-center py-8">Error al cargar</p>';
    console.error(e);
  }
}

/**
 * Guarda las predicciones del jugador
 */
export async function savePred() {
  if (state.SETS.locked) { toast('Cerrado', 'error'); return; }

  var rows = [], any = false, err = false;

  state.MATCHES.forEach(function(m) {
    if (err) return;
    var hi = document.getElementById('ph-' + m.id);
    var ai = document.getElementById('pa-' + m.id);
    var hv = hi ? hi.value.trim() : '';
    var av = ai ? ai.value.trim() : '';

    if (hv !== '' || av !== '') {
      if (hv === '' || av === '') {
        toast('Completa Partido ' + m.id, 'error');
        err = true;
        return;
      }
      var hn = parseInt(hv), an = parseInt(av);
      if (isNaN(hn) || isNaN(an) || hn < 0 || an < 0) {
        toast('Invalido Partido ' + m.id, 'error');
        err = true;
        return;
      }
      rows.push({ player_id: state.ME.id, match_id: m.id, home_goals: hn, away_goals: an });
      any = true;
    }
  });

  if (err) return;
  if (!any) { toast('Ingresa al menos un marcador', 'error'); return; }

  try {
    await savePredictions(rows);
    toast('Predicciones guardadas', 'success');
    renderPredictions();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}
