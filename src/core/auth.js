// ============================================================
// AUTH — Login, PIN, JWT, sesiones
// ============================================================
import { getSupabase } from './api.js';
import { state, resetState } from './state.js';
import { toast, showScreen, navTo } from '../ui/layout.js';
import { closePinModal } from '../ui/components/modal.js';

/**
 * SHA-256 en el navegador
 */
export async function sha256(str) {
  var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(function(b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
}

/**
 * Maneja el submit del PIN de entrada
 */
export async function handlePinSubmit() {
  var pin = document.getElementById('pin-entry').value.trim();
  if (!pin) { toast('Ingresa el PIN', 'error'); return; }

  var btn = document.getElementById('btn-pin');
  var load = document.getElementById('pin-loading');
  btn.disabled = true;
  load.style.display = 'block';

  try {
    var sb = getSupabase();
    var { data: settings, error } = await sb.from('settings').select('entry_pin_hash').single();
    if (error) throw error;

    var hash = await sha256(pin);
    if (hash === settings.entry_pin_hash) {
      sessionStorage.setItem('qm_pin_ok', 'true');
      showScreen('screen-login');
      document.getElementById('login-name').focus();
      toast('PIN correcto', 'success');
    } else {
      toast('PIN incorrecto', 'error');
      document.getElementById('pin-entry').value = '';
      document.getElementById('pin-entry').focus();
    }
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    load.style.display = 'none';
  }
}

/**
 * Maneja el login con nombre de jugador
 */
export async function handleLogin() {
  var inp = document.getElementById('login-name');
  var name = inp.value.trim();
  if (!name) { toast('Ingresa tu nombre', 'error'); inp.focus(); return; }
  if (name.length < 2) { toast('Minimo 2 caracteres', 'error'); inp.focus(); return; }

  inp.disabled = true;
  try {
    var sb = getSupabase();
    var { data, error } = await sb.from('players').upsert({ name: name }, { onConflict: 'name' }).select().single();
    if (error) throw error;
    state.ME = data;
    sessionStorage.setItem('qm_session', JSON.stringify(state.ME));
    await loadAppData();
    toast('Bienvenido, ' + name, 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    inp.disabled = false;
  }
}

/**
 * Carga los datos de la app y muestra la pantalla principal
 */
export async function loadAppData() {
  try {
    var sb = getSupabase();
    var [sR, mR] = await Promise.all([
      sb.from('settings').select('*').single(),
      sb.from('matches').select('*').order('id')
    ]);
    state.SETS = sR.data;
    state.MATCHES = mR.data;
    document.getElementById('screen-pin').classList.remove('active');
    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('app-main').style.display = 'block';
    document.getElementById('sidebar-username').textContent = state.ME.name;
    navTo('predictions');
  } catch (e) {
    toast('Error cargando datos', 'error');
    console.error(e);
  }
}

/**
 * Cierra sesión y vuelve a la pantalla de PIN
 */
export function doLogout() {
  resetState();
  sessionStorage.removeItem('qm_session');
  sessionStorage.removeItem('qm_pin_ok');
  document.getElementById('app-main').style.display = 'none';
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('pin-entry').value = '';
  document.getElementById('login-name').value = '';
  showScreen('screen-pin');
  document.getElementById('pin-entry').focus();
}

/**
 * Verifica el PIN de administrador
 */
export async function verifyAdminPin() {
  var pin = document.getElementById('admin-pin-input').value.trim();
  if (!pin) { toast('Ingresa el PIN', 'error'); return; }

  var hash = await sha256(pin);
  if (hash === state.SETS.admin_pin_hash) {
    state.IS_ADMIN = true;
    closePinModal();
    toast('Admin activado', 'success');
    navTo('admin');
  } else {
    toast('PIN incorrecto', 'error');
    document.getElementById('admin-pin-input').value = '';
    document.getElementById('admin-pin-input').focus();
  }
}

/**
 * Restaura sesión previa si existe
 */
export async function restoreSession() {
  var pinOk = sessionStorage.getItem('qm_pin_ok') === 'true';
  var sessData = sessionStorage.getItem('qm_session');

  if (pinOk && sessData) {
    state.ME = JSON.parse(sessData);
    var sb = getSupabase();
    var { data: pc } = await sb.from('players').select('id,name').eq('id', state.ME.id).single();
    if (pc) {
      state.ME = pc;
      await loadAppData();
      return true;
    }
  }
  return false;
}
