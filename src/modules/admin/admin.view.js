// ============================================================
// ADMIN VIEW — Renderizado de la sección de administración
// ============================================================
import { state } from '../../core/state.js';
import { esc, ea } from '../../utils/dom.js';
import { padId, formatDate } from '../../utils/format.js';

/**
 * Genera el HTML de la pestaña de equipos
 */
export function renderTeamsTab() {
  var h = '<div class="bg-card border border-border rounded-xl p-5 mb-4">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-1">Editar Equipos</h3>' +
    '<p class="text-muted text-xs mb-5">Nombres de equipos para octavos</p>';

  state.MATCHES.forEach(function(m) {
    h += '<div class="mb-5 pb-5 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">' +
      '<span class="text-xs font-bold text-muted font-display tracking-wider">PARTIDO ' + padId(m.id) + '</span>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">' +
      '<div><label class="text-xs text-muted mb-1 block">Local</label>' +
      '<input type="text" maxlength="30" value="' + ea(m.home_team) + '" id="et-h-' + m.id + '" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-gold transition-all"></div>' +
      '<div><label class="text-xs text-muted mb-1 block">Visitante</label>' +
      '<input type="text" maxlength="30" value="' + ea(m.away_team) + '" id="et-a-' + m.id + '" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-gold transition-all"></div>' +
      '</div></div>';
  });

  h += '<button onclick="saveTeams()" class="btn-gold text-sm mt-2"><i class="fas fa-save mr-2"></i>Guardar Equipos</button></div>';
  return h;
}

/**
 * Genera el HTML de la pestaña de resultados
 */
export function renderResultsTab() {
  var h = '<div class="bg-card border border-border rounded-xl p-5 mb-4">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-1">Ingresar Resultados</h3>' +
    '<p class="text-muted text-xs mb-5">Marcadores reales</p>';

  state.MATCHES.forEach(function(m) {
    var hr = m.home_result !== null && m.away_result !== null;
    h += '<div class="mb-5 pb-5 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">' +
      '<div class="flex flex-wrap items-center justify-between gap-2 mb-2">' +
      '<span class="text-xs font-bold text-muted font-display tracking-wider">PARTIDO ' + padId(m.id) + '</span>' +
      (hr ? '<button onclick="clrR(' + m.id + ')" class="text-xs text-danger/60 hover:text-danger transition-colors cursor-pointer bg-transparent border-none font-body"><i class="fas fa-eraser mr-1"></i>Limpiar</button>' : '') +
      '</div>' +
      '<div class="flex items-center gap-2 mb-2">' +
      '<span class="flex-1 text-sm font-semibold text-txt truncate text-right">' + esc(m.home_team) + '</span>' +
      '<input type="number" min="0" max="99" class="goal-input result-input" id="rh-' + m.id + '" value="' + (hr ? m.home_result : '') + '" placeholder="-">' +
      '<span class="text-muted text-xs font-bold">-</span>' +
      '<input type="number" min="0" max="99" class="goal-input result-input" id="ra-' + m.id + '" value="' + (hr ? m.away_result : '') + '" placeholder="-">' +
      '<span class="flex-1 text-sm font-semibold text-txt truncate">' + esc(m.away_team) + '</span>' +
      '</div></div>';
  });

  h += '<button onclick="saveResults()" class="btn-gold text-sm mt-2"><i class="fas fa-save mr-2"></i>Guardar Resultados</button></div>';
  return h;
}

/**
 * Genera el HTML de la pestaña de control
 */
export function renderControlTab(players) {
  var lk = state.SETS.locked;
  var ns = players || [];

  var h = '<div class="space-y-4">';

  // Bloqueo
  h += '<div class="bg-card border border-border rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-4">Bloqueo de Predicciones</h3>' +
    '<div class="flex items-center justify-between">' +
    '<div><p class="text-sm text-txt">' + (lk ? 'Cerrado' : 'Abierto') + '</p></div>' +
    '<div class="toggle-switch' + (lk ? ' on' : '') + '" onclick="tglLk()" role="switch" tabindex="0"></div>' +
    '</div></div>';

  // PIN Admin
  h += '<div class="bg-card border border-border rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-4">Cambiar PIN Admin</h3>' +
    '<div class="flex gap-3 items-end">' +
    '<div class="flex-1"><label class="text-xs text-muted mb-1 block">Nuevo PIN Admin</label>' +
    '<input type="password" id="npin" maxlength="20" placeholder="Nuevo PIN" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-gold transition-all" autocomplete="off"></div>' +
    '<button onclick="chgPin()" class="btn-outline text-sm">Cambiar</button></div></div>';

  // Jugadores
  h += '<div class="bg-card border border-border rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-1">Jugadores (' + ns.length + ')</h3>' +
    '<p class="text-muted text-xs mb-4">de ~10 esperados</p>';

  if (!ns.length) {
    h += '<p class="text-muted text-sm">Sin jugadores</p>';
  } else {
    h += '<div class="space-y-2">';
    ns.forEach(function(pl) {
      h += '<div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface/50">' +
        '<div class="flex items-center gap-3">' +
        '<div class="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center"><i class="fas fa-user text-gold text-xs"></i></div>' +
        '<div><p class="text-sm font-semibold text-txt">' + esc(pl.name) + '</p>' +
        '<p class="text-xs text-muted">' + formatDate(pl.created_at) + '</p></div>' +
        '</div></div>';
    });
    h += '</div>';
  }
  h += '</div>';

  // Zona peligrosa
  h += '<div class="bg-card border border-danger/20 rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-danger mb-1">Zona Peligrosa</h3>' +
    '<p class="text-muted text-xs mb-4">Acciones irreversibles</p>' +
    '<div class="flex flex-wrap gap-3">' +
    '<button onclick="cfmRR()" class="btn-danger text-sm"><i class="fas fa-eraser mr-1"></i>Borrar Resultados</button>' +
    '<button onclick="cfmRP()" class="btn-danger text-sm"><i class="fas fa-broom mr-1"></i>Borrar Predicciones</button>' +
    '</div></div>';

  h += '</div>';
  return h;
}
