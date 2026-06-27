// ============================================================
// ADMIN CONTROLLER — Lógica de administración
// ============================================================
import { state } from '../../core/state.js';
import { toast } from '../../ui/layout.js';
import { showConfirm } from '../../ui/components/modal.js';
import { updateTeams, clearResult, clearAllResults } from '../../services/matches.service.js';
import { fetchMatches } from '../../services/matches.service.js';
import { deleteAllPredictions } from '../../services/predictions.service.js';
import { toggleLock, changeAdminPin, fetchPlayers } from '../../services/admin.service.js';
import { renderTeamsTab, renderResultsTab, renderControlTab } from './admin.view.js';

/**
 * Renderiza la pantalla de administración
 */
export async function renderAdmin() {
  var c = document.getElementById('admin-content');
  if (!state.IS_ADMIN) {
    c.innerHTML = '<div class="text-center py-16 text-muted"><i class="fas fa-lock text-4xl mb-4 opacity-30"></i><p>No autorizado</p></div>';
    return;
  }

  var h = '<div class="mb-6"><h2 class="font-display text-2xl font-bold text-txt">Administracion</h2>' +
    '<p class="text-muted text-sm mt-0.5">Gestiona equipos, resultados y configuracion</p></div>';

  var tabs = [
    { id: 'matches', l: 'Equipos', i: 'fa-shield-halved' },
    { id: 'results', l: 'Resultados', i: 'fa-clipboard-check' },
    { id: 'control', l: 'Control', i: 'fa-sliders' }
  ];

  h += '<div class="flex gap-2 mb-6">';
  tabs.forEach(function(t) {
    h += '<button onclick="setAdmTab(\'' + t.id + '\')" class="admin-tab' + (state.ADM_TAB === t.id ? ' active' : '') + '">' +
      '<i class="fas ' + t.i + ' mr-1"></i>' + t.l + '</button>';
  });
  h += '</div>';

  if (state.ADM_TAB === 'matches') {
    h += renderTeamsTab();
  } else if (state.ADM_TAB === 'results') {
    h += renderResultsTab();
  } else {
    var players = await fetchPlayers();
    h += renderControlTab(players);
  }

  c.innerHTML = h;
}

/**
 * Cambia la pestaña activa del admin
 */
export function setAdmTab(tab) {
  state.ADM_TAB = tab;
  renderAdmin();
}

/**
 * Guarda los nombres de equipos
 */
export async function saveTeams() {
  try {
    var teams = state.MATCHES.map(function(m) {
      return {
        id: m.id,
        home_team: document.getElementById('et-h-' + m.id).value.trim(),
        away_team: document.getElementById('et-a-' + m.id).value.trim()
      };
    });
    await updateTeams(teams);
    toast('Equipos actualizados', 'success');
    renderAdmin();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

/**
 * Guarda los resultados de los partidos
 */
export async function saveResults() {
  var sb = state.sb;
  try {
    for (var i = 0; i < state.MATCHES.length; i++) {
      var m = state.MATCHES[i];
      var hi = document.getElementById('rh-' + m.id);
      var ai = document.getElementById('ra-' + m.id);
      var hv = hi.value.trim(), av = ai.value.trim();

      if (hv === '' && av === '') {
        await sb.from('matches').update({ home_result: null, away_result: null }).eq('id', m.id);
      } else if (hv !== '' && av !== '') {
        await sb.from('matches').update({ home_result: parseInt(hv), away_result: parseInt(av) }).eq('id', m.id);
      } else {
        toast('Completa Partido ' + m.id, 'error');
        return;
      }
    }
    await fetchMatches();
    state.ALL_PREDICTIONS = [];
    toast('Resultados guardados', 'success');
    renderAdmin();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

/**
 * Limpia el resultado de un partido
 */
export async function clrR(id) {
  await clearResult(id);
  toast('Resultado P' + id + ' eliminado', 'info');
  renderAdmin();
}

/**
 * Alterna el bloqueo de predicciones
 */
export async function tglLk() {
  var newLocked = await toggleLock();
  toast(newLocked ? 'Cerrado' : 'Abierto', newLocked ? 'error' : 'success');
  renderAdmin();
}

/**
 * Cambia el PIN de administrador
 */
export async function chgPin() {
  var inp = document.getElementById('npin');
  var np = inp.value.trim();
  if (!np || np.length < 3) { toast('PIN minimo 3 caracteres', 'error'); return; }
  await changeAdminPin(np);
  inp.value = '';
  toast('PIN admin cambiado', 'success');
}

/**
 * Confirma borrar todos los resultados
 */
export function cfmRR() {
  showConfirm('Borrar Resultados', 'Se eliminaran todos los resultados reales.', async function() {
    await clearAllResults();
    toast('Resultados borrados', 'info');
    renderAdmin();
  });
}

/**
 * Confirma borrar todas las predicciones
 */
export function cfmRP() {
  showConfirm('Borrar Predicciones', 'Se eliminaran TODAS las predicciones.', async function() {
    await deleteAllPredictions();
    toast('Predicciones borradas', 'info');
    renderAdmin();
  });
}
