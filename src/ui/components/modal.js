// ============================================================
// MODAL — Componentes de diálogos modales
// ============================================================

var confirmCallback = null;

/**
 * Abre el modal de PIN admin
 */
export function openPinModal() {
  document.getElementById('admin-pin-input').value = '';
  document.getElementById('modal-pin').classList.add('active');
  setTimeout(function() {
    document.getElementById('admin-pin-input').focus();
  }, 100);
}

/**
 * Cierra el modal de PIN admin
 */
export function closePinModal() {
  document.getElementById('modal-pin').classList.remove('active');
}

/**
 * Muestra el modal de confirmación
 */
export function showConfirm(title, message, callback) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = message;
  confirmCallback = callback;
  document.getElementById('modal-confirm').classList.add('active');
}

/**
 * Cierra el modal de confirmación
 */
export function closeConfirmModal() {
  document.getElementById('modal-confirm').classList.remove('active');
  confirmCallback = null;
}

/**
 * Ejecuta el callback de confirmación y cierra el modal
 */
export function executeConfirm() {
  if (confirmCallback) confirmCallback();
  closeConfirmModal();
}

/**
 * Registra los event listeners de los modales
 */
export function initModals() {
  // Botón de confirmar
  document.getElementById('confirm-btn').addEventListener('click', function() {
    executeConfirm();
  });

  // Cerrar modales con Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closePinModal();
      closeConfirmModal();
    }
  });

  // Cerrar modales al hacer click fuera
  document.getElementById('modal-pin').addEventListener('click', function(e) {
    if (e.target === this) closePinModal();
  });
  document.getElementById('modal-confirm').addEventListener('click', function(e) {
    if (e.target === this) closeConfirmModal();
  });
}
