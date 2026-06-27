// ============================================================
// APP.JS — Entry Point
// ============================================================

// Core
import { initSupabase } from './core/api.js';
import { state } from './core/state.js';
import { handlePinSubmit, handleLogin, doLogout, verifyAdminPin, restoreSession } from './core/auth.js';

// UI
import { registerRoute, showScreen, navTo, toast } from './ui/layout.js';
import { initModals, closePinModal, closeConfirmModal } from './ui/components/modal.js';

// Modules
import { renderPredictions, savePred } from './modules/matches/matches.controller.js';
import { renderStandings, renderDetails, setDetailMatch } from './modules/leaderboard/leaderboard.controller.js';
import { renderAdmin, setAdmTab, saveTeams, saveResults, clrR, tglLk, chgPin, cfmRR, cfmRP } from './modules/admin/admin.controller.js';

// Utils
import { esc } from './utils/dom.js';

// ============================================================
// REGISTRAR RUTAS
// ============================================================
registerRoute('predictions', renderPredictions);
registerRoute('standings', renderStandings);
registerRoute('details', renderDetails);
registerRoute('admin', renderAdmin);

// ============================================================
// EXPONER AL SCOPE GLOBAL (para onclick en HTML)
// ============================================================
window.handlePinSubmit = handlePinSubmit;
window.handleLogin = handleLogin;
window.doLogout = doLogout;
window.navTo = navTo;
window.verifyAdminPin = verifyAdminPin;
window.closePinModal = closePinModal;
window.closeConfirmModal = closeConfirmModal;
window.savePred = savePred;
window.setDetailMatch = setDetailMatch;
window.setAdmTab = setAdmTab;
window.saveTeams = saveTeams;
window.saveResults = saveResults;
window.clrR = clrR;
window.tglLk = tglLk;
window.chgPin = chgPin;
window.cfmRR = cfmRR;
window.cfmRP = cfmRP;

// ============================================================
// INICIALIZACION
// ============================================================
async function init() {
  try {
    initSupabase();
    initModals();

    // Intentar restaurar sesión previa
    var restored = await restoreSession();
    if (restored) return;

    // Sin sesión → mostrar pantalla de PIN
    showScreen('screen-pin');
    document.getElementById('pin-entry').focus();
  } catch (err) {
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;color:#fca5a5;font-family:sans-serif;text-align:center;padding:20px"><div>' +
      '<i class="fas fa-exclamation-triangle" style="font-size:48px;margin-bottom:16px;display:block"></i>' +
      '<p style="font-size:18px;margin-bottom:8px">Error de conexion</p>' +
      '<p style="font-size:14px;color:#5a6a8a">' + esc(String(err)) + '</p>' +
      '<p style="font-size:12px;color:#5a6a8a;margin-top:16px">Verifica la configuracion en src/config.js</p>' +
      '</div></div>';
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.getElementById('pin-entry').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handlePinSubmit();
});
document.getElementById('login-name').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleLogin();
});
document.getElementById('admin-pin-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') verifyAdminPin();
});

// ============================================================
// SERVICE WORKER
// ============================================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function() {});
}

// ============================================================
// INICIO
// ============================================================
init();
