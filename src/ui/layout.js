// ============================================================
// LAYOUT — Navegación, sidebar, toasts
// ============================================================
import { state } from '../core/state.js';
import { esc } from '../utils/dom.js';
import { openPinModal } from './components/modal.js';

// Registro de rutas: { nombre: handler }
var routes = {};

/**
 * Registra una ruta con su handler de renderizado
 */
export function registerRoute(name, handler) {
  routes[name] = handler;
}

/**
 * Muestra una pantalla (para login/pin)
 */
export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

/**
 * Navega a una sección de la app
 */
export function navTo(sid) {
  if (sid === 'admin' && !state.IS_ADMIN) {
    openPinModal();
    return;
  }
  state.CUR_SCREEN = sid;

  // Activar pantalla
  document.querySelectorAll('#content .screen').forEach(function(s) {
    s.classList.remove('active');
  });
  var tg = document.getElementById('screen-' + sid);
  if (tg) tg.classList.add('active');

  // Activar items de navegación
  document.querySelectorAll('#sidebar .nav-item').forEach(function(n) {
    n.classList.remove('active');
  });
  document.querySelectorAll('#bottom-nav .bnav-item').forEach(function(n) {
    n.classList.remove('active');
  });
  document.querySelectorAll('[data-screen="' + sid + '"]').forEach(function(n) {
    n.classList.add('active');
  });

  // Ejecutar el handler de la ruta
  if (routes[sid]) routes[sid]();
}

/**
 * Muestra un mensaje toast
 */
export function toast(msg, type) {
  type = type || 'success';
  var c = document.getElementById('toast-container');
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;

  var icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };

  t.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + esc(msg) + '</span>';
  c.appendChild(t);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      t.classList.add('show');
    });
  });

  setTimeout(function() {
    t.classList.remove('show');
    setTimeout(function() { t.remove(); }, 300);
  }, 3000);
}
