// ============================================================
// DOM — Utilidades de manipulación del DOM
// ============================================================

/**
 * Escapa HTML para prevenir XSS (textContent → innerHTML)
 */
export function esc(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/**
 * Escapa atributos HTML (para valores dentro de atributos)
 */
export function ea(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Shortcut para document.querySelector
 */
export function $(sel) {
  return document.querySelector(sel);
}

/**
 * Shortcut para document.querySelectorAll
 */
export function $$(sel) {
  return document.querySelectorAll(sel);
}
