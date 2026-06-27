// ============================================================
// TABLE — Componentes de tablas y KPIs
// ============================================================
import { esc } from '../../utils/dom.js';

/**
 * Genera una tarjeta KPI
 */
export function kpiCard(icon, label, value, textColor, bgColor, borderColor) {
  return '<div class="' + bgColor + ' border ' + borderColor + ' rounded-xl p-4">' +
    '<div class="flex items-center gap-2 mb-2">' +
    '<i class="fas ' + icon + ' ' + textColor + ' text-sm"></i>' +
    '<span class="text-muted text-xs font-medium">' + label + '</span>' +
    '</div>' +
    '<p class="font-display text-xl font-bold ' + textColor + ' truncate">' + esc(String(value)) + '</p>' +
    '</div>';
}

/**
 * Genera el header de una tabla
 */
export function buildTableHeader(columns) {
  var h = '<tr class="border-b border-border text-left">';
  columns.forEach(function(col) {
    h += '<th class="px-4 py-3 text-muted font-semibold text-xs' +
      (col.align ? ' text-' + col.align : '') +
      (col.hide ? ' hidden ' + col.hide : '') +
      (col.width ? ' ' + col.width : '') +
      (col.style ? '" style="' + col.style : '') +
      '">' + col.label + '</th>';
  });
  h += '</tr>';
  return h;
}

/**
 * Genera una celda de la matriz de puntos
 */
export function buildMatrixCell(pts) {
  var cl = pts === 5 ? 'pts-5' : pts === 3 ? 'pts-3' : 'pts-0';
  return '<td class="px-1 py-1.5 text-center">' +
    '<div class="matrix-cell ' + cl + ' mx-auto">' + pts + '</div>' +
    '</td>';
}

/**
 * Genera la leyenda de la matriz
 */
export function buildMatrixLegend() {
  return '<div class="flex gap-5 mt-3 text-xs text-muted">' +
    '<span><span class="matrix-cell pts-5 inline-flex w-5 h-5 text-[10px] mr-1">5</span> Exacto</span>' +
    '<span><span class="matrix-cell pts-3 inline-flex w-5 h-5 text-[10px] mr-1">3</span> Resultado</span>' +
    '<span><span class="matrix-cell pts-0 inline-flex w-5 h-5 text-[10px] mr-1">0</span> Fallido</span>' +
    '</div>';
}
