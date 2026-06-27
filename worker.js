// ============================================================
// QUINIELA MUNDIALISTA - Cloudflare Worker PWA
// Sistema de predicciones para octavos de final del Mundial FIFA
// ============================================================

// Tag function para evitar interpolación del template exterior
function raw(strings) { return strings.raw[0]; }

// ----- MANIFEST PWA -----
const MANIFEST = JSON.stringify({
  name: "Quiniela Mundialista",
  short_name: "Quiniela",
  description: "Predice los marcadores de los octavos de final del Mundial FIFA",
  start_url: "/",
  display: "standalone",
  background_color: "#080c14",
  theme_color: "#080c14",
  icons: [{
    src: "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='80' fill='#080c14'/><circle cx='256' cy='220' r='110' fill='none' stroke='#d4a537' stroke-width='14'/><path d='M205 220 L245 260 L310 180' fill='none' stroke='#d4a537' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/><text x='256' y='390' text-anchor='middle' font-family='sans-serif' font-size='72' font-weight='bold' fill='#d4a537'>Q</text></svg>"),
    sizes: "512x512",
    type: "image/svg+xml",
    purpose: "any maskable"
  }]
});

// ----- SERVICE WORKER -----
const SW = `
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        if (resp.status === 200) {
          var c = resp.clone();
          caches.open('quiniela-v1').then(function(cache) { cache.put(e.request, c); });
        }
        return resp;
      });
    }).catch(function() {
      if (e.request.destination === 'document') {
        return caches.match('/');
      }
    })
  );
});
`;

// ----- HTML COMPLETO -----
const HTML = raw`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Quiniela Mundialista</title>
<meta name="description" content="Predice los marcadores de los octavos de final del Mundial FIFA">
<meta name="theme-color" content="#080c14">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdn.tailwindcss.com"><\/script>
<script>
tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: '#080c14',
        surface: '#0d1320',
        card: '#111a2e',
        cardhover: '#162040',
        border: '#1a2744',
        gold: '#d4a537',
        goldlight: '#f0d078',
        golddark: '#a07a1a',
        success: '#10b981',
        danger: '#ef4444',
        info: '#3b82f6',
        txt: '#e2e8f0',
        muted: '#5a6a8a',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      }
    }
  }
}
<\/script>
<style>
  :root {
    --gold: #d4a537;
    --gold-light: #f0d078;
    --bg: #080c14;
    --surface: #0d1320;
    --card: #111a2e;
    --border: #1a2744;
    --success: #10b981;
    --danger: #ef4444;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: #e2e8f0;
    min-height: 100dvh;
    overflow-x: hidden;
  }

  /* Scrollbar personalizado */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1a2744; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #2a3a5a; }

  /* Blobs de fondo animados */
  .bg-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(130px);
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(212,165,55,0.12), transparent 70%);
    top: -10%; left: -5%;
    animation: blobFloat1 25s ease-in-out infinite;
  }
  .blob-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%);
    bottom: -10%; right: -5%;
    animation: blobFloat2 30s ease-in-out infinite;
  }
  .blob-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(212,165,55,0.06), transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation: blobFloat3 20s ease-in-out infinite;
  }

  @keyframes blobFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(60px, 40px) scale(1.1); }
    66% { transform: translate(-30px, 80px) scale(0.95); }
  }
  @keyframes blobFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-50px, -30px) scale(1.05); }
    66% { transform: translate(40px, -60px) scale(0.9); }
  }
  @keyframes blobFloat3 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.2); }
  }

  /* Pantallas */
  .screen { display: none; }
  .screen.active { display: block; animation: fadeSlideIn 0.35s ease-out; }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(212,165,55,0.3); }
    50% { box-shadow: 0 0 20px 4px rgba(212,165,55,0.15); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Sidebar */
  #sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    width: 240px;
    background: #0a1020;
    border-right: 1px solid var(--border);
    z-index: 40;
    display: flex; flex-direction: column;
    transition: transform 0.3s ease;
  }
  #sidebar .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 20px;
    color: #5a6a8a;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    font-size: 14px; font-weight: 500;
  }
  #sidebar .nav-item:hover { color: #c0c8d8; background: rgba(255,255,255,0.02); }
  #sidebar .nav-item.active {
    color: var(--gold);
    background: rgba(212,165,55,0.06);
    border-left-color: var(--gold);
  }
  #sidebar .nav-item i { width: 20px; text-align: center; font-size: 15px; }

  /* Bottom nav (mobile) */
  #bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #0a1020;
    border-top: 1px solid var(--border);
    z-index: 40;
    display: none;
  }
  #bottom-nav .bnav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    padding: 8px 4px 6px;
    color: #5a6a8a; font-size: 10px; font-weight: 500;
    cursor: pointer; transition: color 0.2s;
    gap: 3px;
  }
  #bottom-nav .bnav-item i { font-size: 18px; }
  #bottom-nav .bnav-item.active { color: var(--gold); }

  /* Content area */
  #content {
    margin-left: 240px;
    min-height: 100dvh;
    padding: 24px 28px 24px;
    position: relative;
    z-index: 1;
  }

  /* Input de goles */
  .goal-input {
    width: 52px; height: 44px;
    background: #0a1020;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    color: #fff;
    font-family: 'Oswald', sans-serif;
    font-size: 22px;
    text-align: center;
    outline: none;
    transition: all 0.2s;
    -moz-appearance: textfield;
  }
  .goal-input::-webkit-outer-spin-button,
  .goal-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .goal-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(212,165,55,0.15); }
  .goal-input:disabled { opacity: 0.4; cursor: not-allowed; }
  .goal-input.result-input { border-color: rgba(16,185,129,0.3); }
  .goal-input.result-input:focus { border-color: var(--success); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }

  /* Toast */
  #toast-container {
    position: fixed; top: 20px; right: 20px;
    z-index: 9999; display: flex; flex-direction: column; gap: 8px;
  }
  .toast {
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    backdrop-filter: blur(12px);
    min-width: 240px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .toast.show { transform: translateX(0); }
  .toast-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; }
  .toast-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
  .toast-info { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: none; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal-overlay.active { display: flex; }
  .modal-box {
    background: #111a2e;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    max-width: 420px; width: 100%;
    animation: scaleIn 0.25s ease-out;
  }

  /* Card de partido */
  .match-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    transition: all 0.25s;
  }
  .match-card:hover { border-color: #253558; background: #142040; }
  .match-card.has-result { border-color: rgba(16,185,129,0.2); }

  /* Celda de la matriz de puntos */
  .matrix-cell {
    width: 36px; height: 36px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Oswald', sans-serif;
    font-size: 15px; font-weight: 600;
  }
  .matrix-cell.pts-5 { background: rgba(212,165,55,0.2); color: var(--gold); }
  .matrix-cell.pts-3 { background: rgba(16,185,129,0.15); color: #6ee7b7; }
  .matrix-cell.pts-0 { background: rgba(90,106,138,0.1); color: #3a4a6a; }

  /* Barra de progreso de puntos */
  .pts-bar {
    height: 6px;
    border-radius: 3px;
    background: #1a2744;
    overflow: hidden;
  }
  .pts-bar-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
    transition: width 0.8s ease;
  }

  /* Botón dorado */
  .btn-gold {
    background: linear-gradient(135deg, #d4a537, #c09520);
    color: #080c14;
    font-weight: 700;
    border: none;
    border-radius: 10px;
    padding: 12px 28px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
  }
  .btn-gold:hover { background: linear-gradient(135deg, #f0d078, #d4a537); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(212,165,55,0.3); }
  .btn-gold:active { transform: translateY(0); }
  .btn-gold:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-outline {
    background: transparent;
    color: #c0c8d8;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
  }
  .btn-outline:hover { border-color: #3a4a6a; background: rgba(255,255,255,0.03); }

  .btn-danger {
    background: rgba(239,68,68,0.12);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px;
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
  }
  .btn-danger:hover { background: rgba(239,68,68,0.2); }

  /* Toggle switch */
  .toggle-switch {
    position: relative;
    width: 48px; height: 26px;
    background: #1a2744;
    border-radius: 13px;
    cursor: pointer;
    transition: background 0.3s;
  }
  .toggle-switch.on { background: var(--gold); }
  .toggle-switch::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 20px; height: 20px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.3s;
  }
  .toggle-switch.on::after { transform: translateX(22px); }

  /* Medallas */
  .medal { font-size: 18px; }
  .medal-gold { color: #ffd700; }
  .medal-silver { color: #c0c0c0; }
  .medal-bronze { color: #cd7f32; }

  /* Status badge */
  .status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px; font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .status-open { background: rgba(16,185,129,0.12); color: #6ee7b7; }
  .status-locked { background: rgba(239,68,68,0.12); color: #fca5a5; }

  /* Login card shimmer */
  .login-card {
    position: relative;
    overflow: hidden;
  }
  .login-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(212,165,55,0.04) 45%, rgba(212,165,55,0.08) 50%, rgba(212,165,55,0.04) 55%, transparent 60%);
    animation: shimmer 4s ease-in-out infinite;
  }
  @keyframes shimmer {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  /* Tab activo en admin */
  .admin-tab {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: #5a6a8a;
  }
  .admin-tab:hover { color: #c0c8d8; }
  .admin-tab.active { background: rgba(212,165,55,0.1); color: var(--gold); }

  /* Responsive */
  @media (max-width: 768px) {
    #sidebar { display: none; }
    #bottom-nav { display: flex; }
    #content { margin-left: 0; padding: 16px 14px 90px; }
    .goal-input { width: 46px; height: 40px; font-size: 20px; }
    .match-card { padding: 14px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
</head>
<body>

<!-- Blobs de fondo -->
<div class="bg-blob blob-1"></div>
<div class="bg-blob blob-2"></div>
<div class="bg-blob blob-3"></div>

<!-- ========== PANTALLA LOGIN ========== -->
<div id="screen-login" class="screen active">
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="login-card bg-card border border-border rounded-2xl p-8 sm:p-10 w-full max-w-md relative" style="animation: scaleIn 0.5s ease-out">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-gold/30 mb-5" style="animation: pulse-gold 3s ease-in-out infinite">
          <i class="fas fa-futbol text-gold text-3xl"></i>
        </div>
        <h1 class="font-display text-4xl sm:text-5xl font-bold text-gold tracking-wide">QUINIELA</h1>
        <p class="font-display text-lg text-gold/60 tracking-widest mt-1">MUNDIALISTA</p>
        <p class="text-muted text-sm mt-3">Octavos de Final &mdash; FIFA World Cup</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-muted mb-2" for="login-name">Tu nombre</label>
          <input id="login-name" type="text" maxlength="20" placeholder="Ingresa tu nombre..."
            class="w-full bg-surface border border-border rounded-10 px-4 py-3 text-txt text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all"
            style="border-radius:10px"
            autocomplete="off">
        </div>
        <button id="btn-login" class="btn-gold w-full" onclick="handleLogin()">
          <i class="fas fa-arrow-right mr-2"></i>Entrar a la Quiniela
        </button>
      </div>

      <div class="mt-6 flex items-center justify-between text-xs">
        <button onclick="showScreenDirect('standings')" class="text-muted hover:text-gold transition-colors cursor-pointer bg-transparent border-none font-body">
          <i class="fas fa-trophy mr-1"></i>Ver Clasificacion
        </button>
        <button onclick="openPinModal()" class="text-muted hover:text-gold transition-colors cursor-pointer bg-transparent border-none font-body">
          <i class="fas fa-lock mr-1"></i>Admin
        </button>
      </div>

      <p class="text-center text-muted/50 text-xs mt-8">
        PWA &mdash; Funciona sin conexion una vez cargada
      </p>
    </div>
  </div>
</div>

<!-- ========== APP PRINCIPAL ========== -->
<div id="app-main" style="display:none">

  <!-- Sidebar Desktop -->
  <nav id="sidebar" role="navigation" aria-label="Navegacion principal">
    <div class="p-5 border-b border-border">
      <p class="font-display text-lg font-bold text-gold tracking-wide">QUINIELA</p>
      <p class="text-muted text-xs mt-0.5">Mundialista</p>
    </div>
    <div class="flex-1 py-4 space-y-1">
      <div class="nav-item active" data-screen="predictions" onclick="navigateTo('predictions')" role="button" tabindex="0" aria-label="Mis Predicciones">
        <i class="fas fa-futbol"></i><span>Mis Predicciones</span>
      </div>
      <div class="nav-item" data-screen="standings" onclick="navigateTo('standings')" role="button" tabindex="0" aria-label="Clasificacion">
        <i class="fas fa-trophy"></i><span>Clasificacion</span>
      </div>
      <div class="nav-item" data-screen="details" onclick="navigateTo('details')" role="button" tabindex="0" aria-label="Detalle por Partido">
        <i class="fas fa-table-cells"></i><span>Detalle por Partido</span>
      </div>
      <div class="nav-item" data-screen="admin" onclick="navigateTo('admin')" role="button" tabindex="0" aria-label="Administracion">
        <i class="fas fa-gear"></i><span>Administracion</span>
      </div>
    </div>
    <div class="p-4 border-t border-border">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
          <i class="fas fa-user text-gold text-xs"></i>
        </div>
        <div>
          <p id="sidebar-username" class="text-sm font-semibold text-txt truncate max-w-[140px]"></p>
          <p class="text-xs text-muted">Jugador</p>
        </div>
      </div>
      <button onclick="handleLogout()" class="w-full text-left text-xs text-muted hover:text-danger transition-colors cursor-pointer bg-transparent border-none font-body py-1">
        <i class="fas fa-sign-out-alt mr-1"></i>Cerrar sesion
      </button>
    </div>
  </nav>

  <!-- Bottom Nav Mobile -->
  <nav id="bottom-nav" role="navigation" aria-label="Navegacion movil">
    <div class="bnav-item active" data-screen="predictions" onclick="navigateTo('predictions')">
      <i class="fas fa-futbol"></i><span>Pronosticos</span>
    </div>
    <div class="bnav-item" data-screen="standings" onclick="navigateTo('standings')">
      <i class="fas fa-trophy"></i><span>Clasificacion</span>
    </div>
    <div class="bnav-item" data-screen="details" onclick="navigateTo('details')">
      <i class="fas fa-table-cells"></i><span>Detalle</span>
    </div>
    <div class="bnav-item" data-screen="admin" onclick="navigateTo('admin')">
      <i class="fas fa-gear"></i><span>Admin</span>
    </div>
  </nav>

  <!-- Contenido principal -->
  <main id="content">
    <!-- Sección Predicciones -->
    <section id="screen-predictions" class="screen active" aria-label="Mis Predicciones">
      <div id="predictions-content"></div>
    </section>

    <!-- Sección Clasificación -->
    <section id="screen-standings" class="screen" aria-label="Clasificacion">
      <div id="standings-content"></div>
    </section>

    <!-- Sección Detalle -->
    <section id="screen-details" class="screen" aria-label="Detalle por Partido">
      <div id="details-content"></div>
    </section>

    <!-- Sección Admin -->
    <section id="screen-admin" class="screen" aria-label="Administracion">
      <div id="admin-content"></div>
    </section>
  </main>
</div>

<!-- Toast Container -->
<div id="toast-container" aria-live="polite"></div>

<!-- Modal PIN -->
<div id="modal-pin" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Verificacion de administrador">
  <div class="modal-box">
    <div class="text-center mb-5">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 mb-3">
        <i class="fas fa-shield-halved text-gold text-xl"></i>
      </div>
      <h3 class="font-display text-xl font-bold text-txt">Acceso Administrador</h3>
      <p class="text-muted text-sm mt-1">Ingresa el PIN de administrador</p>
    </div>
    <input id="pin-input" type="password" maxlength="6" placeholder="PIN"
      class="w-full bg-surface border border-border rounded-lg px-4 py-3 text-txt text-center text-lg tracking-[0.3em] outline-none focus:border-gold transition-all mb-4"
      autocomplete="off">
    <div class="flex gap-3">
      <button onclick="closePinModal()" class="btn-outline flex-1">Cancelar</button>
      <button onclick="verifyPin()" class="btn-gold flex-1">Verificar</button>
    </div>
  </div>
</div>

<!-- Modal Confirmación -->
<div id="modal-confirm" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirmacion">
  <div class="modal-box">
    <div class="text-center mb-5">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-danger/10 mb-3">
        <i class="fas fa-exclamation-triangle text-danger text-xl"></i>
      </div>
      <h3 id="confirm-title" class="font-display text-xl font-bold text-txt"></h3>
      <p id="confirm-msg" class="text-muted text-sm mt-2"></p>
    </div>
    <div class="flex gap-3">
      <button onclick="closeConfirmModal()" class="btn-outline flex-1">Cancelar</button>
      <button id="confirm-btn" class="btn-danger flex-1">Confirmar</button>
    </div>
  </div>
</div>

<script>
// ============================================================
// ESTADO Y DATOS
// ============================================================

const STORAGE_SETTINGS = 'qm_settings';
const STORAGE_PLAYERS = 'qm_players';
const SESSION_PLAYER = 'qm_currentPlayer';
const SESSION_ADMIN = 'qm_adminVerified';
const MAX_POINTS_PER_MATCH = 5;
const TOTAL_MATCHES = 8;

// Estado global de la aplicacion
const APP = {
  currentPlayer: null,
  isAdmin: false,
  settings: null,
  players: null,
  currentScreen: 'predictions',
  adminTab: 'matches',
  selectedDetailMatch: 1
};

// Partidos por defecto (octavos de final genéricos)
function getDefaultSettings() {
  return {
    locked: false,
    adminPin: '2026',
    matches: [
      { id: 1, homeTeam: '1ro Grupo A', awayTeam: '2do Grupo B', homeResult: null, awayResult: null },
      { id: 2, homeTeam: '1ro Grupo C', awayTeam: '2do Grupo D', homeResult: null, awayResult: null },
      { id: 3, homeTeam: '1ro Grupo E', awayTeam: '2do Grupo F', homeResult: null, awayResult: null },
      { id: 4, homeTeam: '1ro Grupo G', awayTeam: '2do Grupo H', homeResult: null, awayResult: null },
      { id: 5, homeTeam: '1ro Grupo B', awayTeam: '2do Grupo A', homeResult: null, awayResult: null },
      { id: 6, homeTeam: '1ro Grupo D', awayTeam: '2do Grupo C', homeResult: null, awayResult: null },
      { id: 7, homeTeam: '1ro Grupo F', awayTeam: '2do Grupo E', homeResult: null, awayResult: null },
      { id: 8, homeTeam: '1ro Grupo H', awayTeam: '2do Grupo G', homeResult: null, awayResult: null }
    ]
  };
}

// Cargar estado desde localStorage
function loadState() {
  try {
    APP.settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS)) || getDefaultSettings();
    // Validar que haya 8 partidos
    if (!APP.settings.matches || APP.settings.matches.length !== 8) {
      APP.settings = getDefaultSettings();
    }
    // Asegurar que cada partido tenga los campos necesarios
    APP.settings.matches.forEach((m, i) => {
      if (!m.id) m.id = i + 1;
      if (m.homeResult === undefined) m.homeResult = null;
      if (m.awayResult === undefined) m.awayResult = null;
    });
    if (!APP.settings.adminPin) APP.settings.adminPin = '2026';
    if (APP.settings.locked === undefined) APP.settings.locked = false;
  } catch(e) {
    APP.settings = getDefaultSettings();
  }

  try {
    APP.players = JSON.parse(localStorage.getItem(STORAGE_PLAYERS)) || {};
  } catch(e) {
    APP.players = {};
  }

  APP.currentPlayer = sessionStorage.getItem(SESSION_PLAYER) || null;
  APP.isAdmin = sessionStorage.getItem(SESSION_ADMIN) === 'true';
}

function saveSettings() {
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(APP.settings));
}

function savePlayers() {
  localStorage.setItem(STORAGE_PLAYERS, JSON.stringify(APP.players));
}

// ============================================================
// SISTEMA DE PUNTUACION
// ============================================================

function calcMatchPoints(pred, match) {
  // Si no hay resultado real, 0 puntos
  if (match.homeResult === null || match.awayResult === null) return 0;
  // Si no hay prediccion, 0
  if (!pred) return 0;

  const ph = parseInt(pred.home) || 0;
  const pa = parseInt(pred.away) || 0;
  const rh = match.homeResult;
  const ra = match.awayResult;

  // Marcador exacto: 5 puntos
  if (ph === rh && pa === ra) return 5;

  // Acertar resultado (quien gana o empate): 3 puntos
  const predSign = Math.sign(ph - pa);
  const realSign = Math.sign(rh - ra);
  if (predSign === realSign) return 3;

  // No acertó: 0 puntos
  return 0;
}

function getPlayerTotalPoints(playerName) {
  const player = APP.players[playerName];
  if (!player) return { total: 0, exactos: 0, aciertos: 0, fallidos: 0, perMatch: [] };

  let total = 0, exactos = 0, aciertos = 0, fallidos = 0;
  const perMatch = APP.settings.matches.map(m => {
    const pred = player.predictions[String(m.id)];
    const pts = calcMatchPoints(pred, m);
    total += pts;
    if (pts === 5) exactos++;
    else if (pts === 3) aciertos++;
    else if (pred) fallidos++;
    return pts;
  });

  return { total, exactos, aciertos, fallidos, perMatch };
}

function getStandings() {
  const names = Object.keys(APP.players);
  const results = names.map(name => {
    const stats = getPlayerTotalPoints(name);
    return { name, ...stats, avg: (stats.total / TOTAL_MATCHES).toFixed(2) };
  });
  // Ordenar: mas puntos primero, luego mas exactos, luego mas aciertos
  results.sort((a, b) => b.total - a.total || b.exactos - a.exactos || b.aciertos - a.aciertos);
  return results;
}

function getMaxPossiblePoints() {
  return TOTAL_MATCHES * MAX_POINTS_PER_MATCH;
}

function getMatchesWithResults() {
  return APP.settings.matches.filter(m => m.homeResult !== null && m.awayResult !== null).length;
}

// ============================================================
// NAVEGACION
// ============================================================

function navigateTo(screenId) {
  // Si es admin y no está verificado, pedir PIN
  if (screenId === 'admin' && !APP.isAdmin) {
    openPinModal(() => navigateTo('admin'));
    return;
  }

  APP.currentScreen = screenId;

  // Actualizar pantallas
  document.querySelectorAll('#content .screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) target.classList.add('active');

  // Actualizar nav activo
  document.querySelectorAll('#sidebar .nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('#bottom-nav .bnav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('[data-screen="' + screenId + '"]').forEach(n => n.classList.add('active'));

  // Renderizar contenido dinamico
  if (screenId === 'predictions') renderPredictions();
  else if (screenId === 'standings') renderStandings();
  else if (screenId === 'details') renderDetails();
  else if (screenId === 'admin') renderAdmin();
}

function showScreenDirect(screenId) {
  // Para acceder desde login sin estar logueado (solo clasificacion)
  APP.currentPlayer = null;
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('app-main').style.display = 'block';
  navigateTo(screenId);
}

// ============================================================
// LOGIN / LOGOUT
// ============================================================

function handleLogin() {
  const input = document.getElementById('login-name');
  const name = input.value.trim();

  if (!name) {
    showToast('Ingresa tu nombre para continuar', 'error');
    input.focus();
    return;
  }
  if (name.length < 2) {
    showToast('El nombre debe tener al menos 2 caracteres', 'error');
    input.focus();
    return;
  }

  APP.currentPlayer = name;
  sessionStorage.setItem(SESSION_PLAYER, name);

  // Crear entrada del jugador si no existe
  if (!APP.players[name]) {
    APP.players[name] = { predictions: {}, savedAt: null };
    savePlayers();
  }

  // Mostrar la app
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('app-main').style.display = 'block';
  document.getElementById('sidebar-username').textContent = name;

  navigateTo('predictions');
  showToast('Bienvenido, ' + name, 'success');
}

function handleLogout() {
  APP.currentPlayer = null;
  APP.isAdmin = false;
  sessionStorage.removeItem(SESSION_PLAYER);
  sessionStorage.removeItem(SESSION_ADMIN);
  document.getElementById('app-main').style.display = 'none';
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('login-name').value = '';
}

// ============================================================
// RENDER: PREDICCIONES
// ============================================================

function renderPredictions() {
  const container = document.getElementById('predictions-content');
  const player = APP.players[APP.currentPlayer];
  const locked = APP.settings.locked;
  const hasResults = APP.settings.matches.some(m => m.homeResult !== null);

  let statusHtml = locked
    ? '<span class="status-badge status-locked"><i class="fas fa-lock text-[10px]"></i> Cerrado</span>'
    : '<span class="status-badge status-open"><i class="fas fa-lock-open text-[10px]"></i> Abierto</span>';

  let headerHtml = '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
    '<div><h2 class="font-display text-2xl font-bold text-txt">Mis Predicciones</h2>' +
    '<p class="text-muted text-sm mt-0.5">Octavos de Final &mdash; ' + statusHtml + '</p></div>';

  if (!locked) {
    headerHtml += '<button class="btn-gold text-sm" onclick="savePredictions()"><i class="fas fa-save mr-2"></i>Guardar</button>';
  } else if (player && player.savedAt) {
    headerHtml += '<span class="text-muted text-xs"><i class="fas fa-clock mr-1"></i>Guardado: ' + new Date(player.savedAt).toLocaleString('es') + '</span>';
  }
  headerHtml += '</div>';

  if (locked) {
    headerHtml += '<div class="bg-danger/8 border border-danger/20 rounded-xl p-3 mb-5 text-sm text-danger/80 flex items-center gap-2" style="animation: slideDown 0.3s ease">' +
      '<i class="fas fa-info-circle"></i>Las predicciones estan cerradas. No se pueden modificar los marcadores.</div>';
  }

  let cardsHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';

  APP.settings.matches.forEach(match => {
    const pred = player ? player.predictions[String(match.id)] : null;
    const predHome = pred ? (pred.home !== '' ? pred.home : '') : '';
    const predAway = pred ? (pred.away !== '' ? pred.away : '') : '';
    const hasResult = match.homeResult !== null && match.awayResult !== null;
    const pts = calcMatchPoints(pred, match);

    let resultHtml = '';
    if (hasResult) {
      let ptsBadge = '';
      if (pts === 5) ptsBadge = '<span class="inline-flex items-center gap-1 text-gold text-xs font-bold"><i class="fas fa-star"></i> +5 Exacto</span>';
      else if (pts === 3) ptsBadge = '<span class="inline-flex items-center gap-1 text-success text-xs font-bold"><i class="fas fa-check"></i> +3 Resultado</span>';
      else ptsBadge = '<span class="inline-flex items-center gap-1 text-danger/60 text-xs"><i class="fas fa-xmark"></i> 0 puntos</span>';

      resultHtml = '<div class="mt-3 pt-3 border-t border-border flex items-center justify-between">' +
        '<span class="text-xs text-muted">Resultado: <span class="font-display text-base font-bold text-txt">' + match.homeResult + ' - ' + match.awayResult + '</span></span>' +
        ptsBadge + '</div>';
    }

    cardsHtml += '<div class="match-card' + (hasResult ? ' has-result' : '') + '">' +
      '<div class="flex items-center justify-between mb-4">' +
        '<span class="text-xs font-bold text-muted font-display tracking-wider">PARTIDO ' + String(match.id).padStart(2, '0') + '</span>' +
        (locked ? '<i class="fas fa-lock text-muted/30 text-xs"></i>' : '') +
      '</div>' +
      '<div class="flex items-center justify-between gap-3">' +
        '<div class="flex-1 text-right">' +
          '<p class="font-display text-base sm:text-lg font-semibold text-txt truncate">' + escHtml(match.homeTeam) + '</p>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
          '<input type="number" min="0" max="99" class="goal-input' + (locked ? '' : '') + '" ' +
            'id="pred-home-' + match.id + '" value="' + escAttr(predHome) + '" ' +
            (locked ? 'disabled' : '') + ' aria-label="Goles ' + escAttr(match.homeTeam) + '">' +
          '<span class="text-muted text-xs font-bold">-</span>' +
          '<input type="number" min="0" max="99" class="goal-input' + (locked ? '' : '') + '" ' +
            'id="pred-away-' + match.id + '" value="' + escAttr(predAway) + '" ' +
            (locked ? 'disabled' : '') + ' aria-label="Goles ' + escAttr(match.awayTeam) + '">' +
        '</div>' +
        '<div class="flex-1">' +
          '<p class="font-display text-base sm:text-lg font-semibold text-txt truncate">' + escHtml(match.awayTeam) + '</p>' +
        '</div>' +
      '</div>' +
      resultHtml +
    '</div>';
  });

  cardsHtml += '</div>';

  // Resumen de puntos si hay resultados
  let summaryHtml = '';
  if (hasResults && player) {
    const stats = getPlayerTotalPoints(APP.currentPlayer);
    const maxPts = getMaxPossiblePoints();
    const pct = Math.round((stats.total / maxPts) * 100);
    summaryHtml = '<div class="mt-6 bg-card border border-border rounded-xl p-5">' +
      '<div class="flex items-center justify-between mb-3">' +
        '<span class="font-display text-lg font-bold text-txt">Mi Rendimiento</span>' +
        '<span class="font-display text-2xl font-bold text-gold">' + stats.total + '<span class="text-sm text-muted font-body font-normal"> / ' + maxPts + ' pts</span></span>' +
      '</div>' +
      '<div class="pts-bar mb-3"><div class="pts-bar-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="flex gap-6 text-sm">' +
        '<span class="text-gold"><i class="fas fa-star mr-1"></i>' + stats.exactos + ' exactos</span>' +
        '<span class="text-success"><i class="fas fa-check mr-1"></i>' + stats.aciertos + ' aciertos</span>' +
        '<span class="text-danger/60"><i class="fas fa-xmark mr-1"></i>' + stats.fallidos + ' fallidos</span>' +
      '</div>' +
    '</div>';
  }

  container.innerHTML = headerHtml + cardsHtml + summaryHtml;
}

function savePredictions() {
  if (APP.settings.locked) {
    showToast('Las predicciones estan cerradas', 'error');
    return;
  }

  const predictions = {};
  let hasAny = false;

  APP.settings.matches.forEach(match => {
    const homeInput = document.getElementById('pred-home-' + match.id);
    const awayInput = document.getElementById('pred-away-' + match.id);
    const home = homeInput ? homeInput.value : '';
    const away = awayInput ? awayInput.value : '';

    // Validar que si un campo tiene valor, el otro tambien
    if (home !== '' || away !== '') {
      if (home === '' || away === '') {
        showToast('Completa ambos marcadores del Partido ' + match.id, 'error');
        if (home === '') homeInput.focus();
        else awayInput.focus();
        return;
      }
      const h = parseInt(home);
      const a = parseInt(away);
      if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
        showToast('Marcadores invalidos en Partido ' + match.id, 'error');
        return;
      }
      predictions[String(match.id)] = { home: h, away: a };
      hasAny = true;
    } else {
      predictions[String(match.id)] = { home: '', away: '' };
    }
  });

  // Verificar que no haya retorno temprano por error (flag sucio)
  const expectedKeys = APP.settings.matches.map(m => String(m.id));
  const actualKeys = Object.keys(predictions);
  if (actualKeys.length !== expectedKeys.length) return;

  if (!hasAny) {
    showToast('Ingresa al menos un marcador', 'error');
    return;
  }

  APP.players[APP.currentPlayer].predictions = predictions;
  APP.players[APP.currentPlayer].savedAt = Date.now();
  savePlayers();
  showToast('Predicciones guardadas correctamente', 'success');
  renderPredictions();
}

// ============================================================
// RENDER: CLASIFICACION
// ============================================================

function renderStandings() {
  const container = document.getElementById('standings-content');
  const standings = getStandings();
  const matchesPlayed = getMatchesWithResults();
  const maxPts = getMaxPossiblePoints();
  const totalPlayers = standings.length;

  let html = '<div class="flex flex-wrap items-end justify-between gap-3 mb-6">' +
    '<div><h2 class="font-display text-2xl font-bold text-txt">Tabla de Posiciones</h2>' +
    '<p class="text-muted text-sm mt-0.5">' + totalPlayers + ' jugadores' +
    (matchesPlayed > 0 ? ' &mdash; ' + matchesPlayed + ' de ' + TOTAL_MATCHES + ' partidos con resultado' : ' &mdash; Sin resultados aun') +
    '</p></div></div>';

  // KPIs resumen
  if (totalPlayers > 0) {
    const leader = standings[0];
    const avgAll = totalPlayers > 0 ? (standings.reduce((s, p) => s + p.total, 0) / totalPlayers).toFixed(1) : '0';
    html += '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">' +
      kpiCard('fa-crown', 'Lider', leader ? leader.name : '-', 'text-gold', 'bg-gold/8', 'border-gold/15') +
      kpiCard('fa-star', 'Max Puntos', leader ? leader.total : '0', 'text-gold', 'bg-gold/8', 'border-gold/15') +
      kpiCard('fa-chart-line', 'Promedio General', avgAll, 'text-info', 'bg-info/8', 'border-info/15') +
      kpiCard('fa-futbol', 'Partidos Jugados', matchesPlayed + '/' + TOTAL_MATCHES, 'text-success', 'bg-success/8', 'border-success/15') +
    '</div>';
  }

  if (totalPlayers === 0) {
    html += '<div class="text-center py-16 text-muted">' +
      '<i class="fas fa-users text-4xl mb-4 opacity-30"></i>' +
      '<p class="text-lg">No hay jugadores registrados aun</p>' +
      '<p class="text-sm mt-1">Los jugadores aparecen aqui cuando guardan sus predicciones</p></div>';
    container.innerHTML = html;
    return;
  }

  // Tabla de posiciones
  html += '<div class="bg-card border border-border rounded-xl overflow-hidden mb-6">' +
    '<div class="overflow-x-auto"><table class="w-full text-sm">' +
    '<thead><tr class="border-b border-border text-left">' +
      '<th class="px-4 py-3 text-muted font-semibold text-xs w-12">#</th>' +
      '<th class="px-4 py-3 text-muted font-semibold text-xs">Jugador</th>' +
      '<th class="px-4 py-3 text-muted font-semibold text-xs text-center">PTS</th>' +
      '<th class="px-4 py-3 text-muted font-semibold text-xs text-center hidden sm:table-cell"><i class="fas fa-star text-gold/50"></i></th>' +
      '<th class="px-4 py-3 text-muted font-semibold text-xs text-center hidden sm:table-cell"><i class="fas fa-check text-success/50"></i></th>' +
      '<th class="px-4 py-3 text-muted font-semibold text-xs text-center hidden md:table-cell"><i class="fas fa-xmark text-danger/40"></i></th>' +
      '<th class="px-4 py-3 text-muted font-semibold text-xs hidden lg:table-cell" style="min-width:120px">Progreso</th>' +
    '</tr></thead><tbody>';

  standings.forEach((p, i) => {
    const rank = i + 1;
    const pct = maxPts > 0 ? Math.round((p.total / maxPts) * 100) : 0;
    let medalHtml = '';
    if (rank === 1) medalHtml = '<span class="medal medal-gold"><i class="fas fa-trophy"></i></span>';
    else if (rank === 2) medalHtml = '<span class="medal medal-silver"><i class="fas fa-medal"></i></span>';
    else if (rank === 3) medalHtml = '<span class="medal medal-bronze"><i class="fas fa-medal"></i></span>';
    else medalHtml = '<span class="text-muted text-sm">' + rank + '</span>';

    const isMe = p.name === APP.currentPlayer;

    html += '<tr class="border-b border-border/50 hover:bg-white/[0.02] transition-colors' + (isMe ? ' bg-gold/[0.04]' : '') + '">' +
      '<td class="px-4 py-3 text-center">' + medalHtml + '</td>' +
      '<td class="px-4 py-3 font-semibold' + (isMe ? ' text-gold' : ' text-txt') + '">' +
        escHtml(p.name) + (isMe ? ' <span class="text-xs text-gold/50 font-normal">(tu)</span>' : '') + '</td>' +
      '<td class="px-4 py-3 text-center"><span class="font-display text-xl font-bold text-txt">' + p.total + '</span></td>' +
      '<td class="px-4 py-3 text-center hidden sm:table-cell"><span class="text-gold font-semibold">' + p.exactos + '</span></td>' +
      '<td class="px-4 py-3 text-center hidden sm:table-cell"><span class="text-success font-semibold">' + p.aciertos + '</span></td>' +
      '<td class="px-4 py-3 text-center hidden md:table-cell"><span class="text-danger/50">' + p.fallidos + '</span></td>' +
      '<td class="px-4 py-3 hidden lg:table-cell"><div class="pts-bar"><div class="pts-bar-fill" style="width:' + pct + '%"></div></div></td>' +
    '</tr>';
  });

  html += '</tbody></table></div></div>';

  // Matriz de puntos por partido
  if (matchesPlayed > 0) {
    html += '<div class="bg-card border border-border rounded-xl p-4 sm:p-5 overflow-x-auto">' +
      '<h3 class="font-display text-lg font-bold text-txt mb-4">Matriz de Puntos por Partido</h3>' +
      '<table class="w-full text-xs">';

    // Header
    html += '<thead><tr class="border-b border-border">' +
      '<th class="px-2 py-2 text-left text-muted font-semibold min-w-[100px]">Jugador</th>';
    APP.settings.matches.forEach(m => {
      html += '<th class="px-1 py-2 text-center text-muted font-semibold w-9">P' + m.id + '</th>';
    });
    html += '<th class="px-2 py-2 text-center text-muted font-bold">TOTAL</th></tr></thead><tbody>';

    standings.forEach(p => {
      const isMe = p.name === APP.currentPlayer;
      html += '<tr class="border-b border-border/30' + (isMe ? ' bg-gold/[0.04]' : '') + '">' +
        '<td class="px-2 py-1.5 font-semibold truncate max-w-[120px]' + (isMe ? ' text-gold' : ' text-txt') + '">' + escHtml(p.name) + '</td>';
      p.perMatch.forEach(pts => {
        const cls = pts === 5 ? 'pts-5' : pts === 3 ? 'pts-3' : 'pts-0';
        html += '<td class="px-1 py-1.5 text-center"><div class="matrix-cell ' + cls + ' mx-auto">' + pts + '</div></td>';
      });
      html += '<td class="px-2 py-1.5 text-center font-display font-bold text-lg text-txt">' + p.total + '</td></tr>';
    });

    html += '</tbody></table></div>';

    // Leyenda
    html += '<div class="flex gap-5 mt-3 text-xs text-muted">' +
      '<span><span class="matrix-cell pts-5 inline-flex w-5 h-5 text-[10px] mr-1">5</span> Exacto</span>' +
      '<span><span class="matrix-cell pts-3 inline-flex w-5 h-5 text-[10px] mr-1">3</span> Resultado</span>' +
      '<span><span class="matrix-cell pts-0 inline-flex w-5 h-5 text-[10px] mr-1">0</span> Fallido</span></div>';
  }

  container.innerHTML = html;
}

function kpiCard(icon, label, value, textColor, bgColor, borderColor) {
  return '<div class="' + bgColor + ' border ' + borderColor + ' rounded-xl p-4">' +
    '<div class="flex items-center gap-2 mb-2">' +
      '<i class="fas ' + icon + ' ' + textColor + ' text-sm"></i>' +
      '<span class="text-muted text-xs font-medium">' + label + '</span>' +
    '</div>' +
    '<p class="font-display text-xl font-bold ' + textColor + ' truncate">' + escHtml(String(value)) + '</p>' +
  '</div>';
}

// ============================================================
// RENDER: DETALLE POR PARTIDO
// ============================================================

function renderDetails() {
  const container = document.getElementById('details-content');
  const showPredictions = APP.settings.locked || !APP.currentPlayer;
  const names = Object.keys(APP.players);

  let html = '<div class="mb-6"><h2 class="font-display text-2xl font-bold text-txt">Detalle por Partido</h2>' +
    '<p class="text-muted text-sm mt-0.5">' +
    (!showPredictions ? 'Las predicciones individuales se muestran cuando las quinielas se cierran' : 'Comparacion de predicciones por cada partido') +
    '</p></div>';

  // Selector de partido
  html += '<div class="flex gap-2 mb-6 overflow-x-auto pb-2" id="detail-tabs">';
  APP.settings.matches.forEach(m => {
    const active = m.id === APP.selectedDetailMatch;
    html += '<button onclick="selectDetailMatch(' + m.id + ')" class="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold font-display tracking-wider transition-all ' +
      (active ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-card border border-border text-muted hover:text-txt hover:border-gold/20') +
      '">P' + String(m.id).padStart(2, '0') + '</button>';
  });
  html += '</div>';

  // Info del partido seleccionado
  const match = APP.settings.matches.find(m => m.id === APP.selectedDetailMatch);
  if (!match) { container.innerHTML = html; return; }

  const hasResult = match.homeResult !== null && match.awayResult !== null;

  html += '<div class="bg-card border border-border rounded-xl p-5 mb-6">' +
    '<div class="flex items-center justify-between gap-4">' +
      '<div class="flex-1 text-right"><p class="font-display text-xl sm:text-2xl font-bold text-txt">' + escHtml(match.homeTeam) + '</p></div>' +
      '<div class="text-center">' +
        '<p class="font-display text-3xl font-bold text-muted">VS</p>' +
        (hasResult ? '<p class="font-display text-lg font-bold text-success mt-1">' + match.homeResult + ' - ' + match.awayResult + '</p>' : '<p class="text-xs text-muted mt-1">Sin resultado</p>') +
      '</div>' +
      '<div class="flex-1"><p class="font-display text-xl sm:text-2xl font-bold text-txt">' + escHtml(match.awayTeam) + '</p></div>' +
    '</div></div>';

  // Tabla de predicciones
  if (names.length === 0) {
    html += '<div class="text-center py-12 text-muted"><i class="fas fa-users text-3xl mb-3 opacity-30"></i><p>No hay jugadores registrados</p></div>';
  } else {
    // Calcular puntos de cada jugador para este partido y ordenar
    const matchPlayers = names.map(name => {
      const pred = APP.players[name].predictions[String(match.id)];
      const pts = calcMatchPoints(pred, match);
      return { name, pred, pts };
    }).sort((a, b) => b.pts - a.pts);

    html += '<div class="bg-card border border-border rounded-xl overflow-hidden">' +
      '<div class="overflow-x-auto"><table class="w-full text-sm">' +
      '<thead><tr class="border-b border-border">' +
        '<th class="px-4 py-3 text-left text-muted font-semibold text-xs w-12">#</th>' +
        '<th class="px-4 py-3 text-left text-muted font-semibold text-xs">Jugador</th>' +
        '<th class="px-4 py-3 text-center text-muted font-semibold text-xs">Prediccion</th>' +
        (hasResult ? '<th class="px-4 py-3 text-center text-muted font-semibold text-xs">Puntos</th>' +
        '<th class="px-4 py-3 text-center text-muted font-semibold text-xs">Estado</th>' : '') +
      '</tr></thead><tbody>';

    matchPlayers.forEach((mp, i) => {
      const isMe = mp.name === APP.currentPlayer;
      const predText = mp.pred ? (mp.pred.home !== '' ? mp.pred.home + ' - ' + mp.pred.away : 'Sin prediccion') : 'Sin prediccion';
      let ptsHtml = hasResult ? '<td class="px-4 py-3 text-center font-display font-bold text-lg ' +
        (mp.pts === 5 ? 'text-gold' : mp.pts === 3 ? 'text-success' : 'text-muted/40') + '">' + mp.pts + '</td>' : '';
      let statusHtml = '';
      if (hasResult) {
        if (mp.pts === 5) statusHtml = '<td class="px-4 py-3 text-center"><span class="inline-flex items-center gap-1 text-gold text-xs font-bold"><i class="fas fa-star"></i> Exacto</span></td>';
        else if (mp.pts === 3) statusHtml = '<td class="px-4 py-3 text-center"><span class="inline-flex items-center gap-1 text-success text-xs font-bold"><i class="fas fa-check"></i> Acierto</span></td>';
        else statusHtml = '<td class="px-4 py-3 text-center"><span class="inline-flex items-center gap-1 text-danger/40 text-xs"><i class="fas fa-xmark"></i> Fallido</span></td>';
      }

      html += '<tr class="border-b border-border/30' + (isMe ? ' bg-gold/[0.04]' : '') + '">' +
        '<td class="px-4 py-3 text-center text-muted">' + (i + 1) + '</td>' +
        '<td class="px-4 py-3 font-semibold' + (isMe ? ' text-gold' : ' text-txt') + '">' + escHtml(mp.name) + (isMe ? ' <span class="text-xs text-gold/50 font-normal">(tu)</span>' : '') + '</td>' +
        '<td class="px-4 py-3 text-center font-display text-base font-semibold text-txt">' + predText + '</td>' +
        ptsHtml + statusHtml + '</tr>';
    });

    html += '</tbody></table></div></div>';
  }

  container.innerHTML = html;
}

function selectDetailMatch(id) {
  APP.selectedDetailMatch = id;
  renderDetails();
}

// ============================================================
// RENDER: ADMIN
// ============================================================

function renderAdmin() {
  const container = document.getElementById('admin-content');
  if (!APP.isAdmin) {
    container.innerHTML = '<div class="text-center py-16 text-muted"><i class="fas fa-lock text-4xl mb-4 opacity-30"></i><p>Acceso no autorizado</p></div>';
    return;
  }

  let html = '<div class="mb-6"><h2 class="font-display text-2xl font-bold text-txt">Panel de Administracion</h2>' +
    '<p class="text-muted text-sm mt-0.5">Gestiona equipos, resultados y configuracion</p></div>';

  // Tabs de admin
  const tabs = [
    { id: 'matches', label: 'Equipos', icon: 'fa-shield-halved' },
    { id: 'results', label: 'Resultados', icon: 'fa-clipboard-check' },
    { id: 'control', label: 'Control', icon: 'fa-sliders' }
  ];

  html += '<div class="flex gap-2 mb-6">';
  tabs.forEach(t => {
    html += '<button onclick="setAdminTab(\'' + t.id + '\')" class="admin-tab' + (APP.adminTab === t.id ? ' active' : '') + '">' +
      '<i class="fas ' + t.icon + ' mr-1"></i>' + t.label + '</button>';
  });
  html += '</div>';

  // Contenido según tab
  if (APP.adminTab === 'matches') html += renderAdminMatches();
  else if (APP.adminTab === 'results') html += renderAdminResults();
  else if (APP.adminTab === 'control') html += renderAdminControl();

  container.innerHTML = html;
}

function renderAdminMatches() {
  let html = '<div class="bg-card border border-border rounded-xl p-5 mb-4">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-1">Editar Equipos</h3>' +
    '<p class="text-muted text-xs mb-5">Modifica los nombres de los equipos para cada partido de octavos</p>';

  APP.settings.matches.forEach(m => {
    html += '<div class="mb-5 pb-5 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">' +
      '<span class="text-xs font-bold text-muted font-display tracking-wider">PARTIDO ' + String(m.id).padStart(2, '0') + '</span>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">' +
        '<div><label class="text-xs text-muted mb-1 block">Equipo Local</label>' +
          '<input type="text" maxlength="30" value="' + escAttr(m.homeTeam) + '" ' +
            'onchange="updateTeam(' + m.id + ', \'home\', this.value)" ' +
            'class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-gold transition-all"></div>' +
        '<div><label class="text-xs text-muted mb-1 block">Equipo Visitante</label>' +
          '<input type="text" maxlength="30" value="' + escAttr(m.awayTeam) + '" ' +
            'onchange="updateTeam(' + m.id + ', \'away\', this.value)" ' +
            'class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-gold transition-all"></div>' +
      '</div></div>';
  });

  html += '</div>';
  return html;
}

function renderAdminResults() {
  let html = '<div class="bg-card border border-border rounded-xl p-5 mb-4">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-1">Ingresar Resultados</h3>' +
    '<p class="text-muted text-xs mb-5">Registra los marcadores reales de cada partido</p>';

  APP.settings.matches.forEach(m => {
    const hasResult = m.homeResult !== null && m.awayResult !== null;
    html += '<div class="mb-5 pb-5 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">' +
      '<div class="flex flex-wrap items-center justify-between gap-2 mb-2">' +
        '<span class="text-xs font-bold text-muted font-display tracking-wider">PARTIDO ' + String(m.id).padStart(2, '0') + '</span>' +
        (hasResult ? '<button onclick="clearResult(' + m.id + ')" class="text-xs text-danger/60 hover:text-danger transition-colors cursor-pointer bg-transparent border-none font-body"><i class="fas fa-eraser mr-1"></i>Limpiar</button>' : '') +
      '</div>' +
      '<div class="flex items-center gap-2 mb-2">' +
        '<span class="flex-1 text-sm font-semibold text-txt truncate text-right">' + escHtml(m.homeTeam) + '</span>' +
        '<input type="number" min="0" max="99" class="goal-input result-input" ' +
          'id="result-home-' + m.id + '" value="' + (hasResult ? m.homeResult : '') + '" placeholder="-" ' +
          'aria-label="Resultado local ' + escAttr(m.homeTeam) + '">' +
        '<span class="text-muted text-xs font-bold">-</span>' +
        '<input type="number" min="0" max="99" class="goal-input result-input" ' +
          'id="result-away-' + m.id + '" value="' + (hasResult ? m.awayResult : '') + '" placeholder="-" ' +
          'aria-label="Resultado visitante ' + escAttr(m.awayTeam) + '">' +
        '<span class="flex-1 text-sm font-semibold text-txt truncate">' + escHtml(m.awayTeam) + '</span>' +
      '</div></div>';
  });

  html += '<button onclick="saveResults()" class="btn-gold text-sm mt-2"><i class="fas fa-save mr-2"></i>Guardar Resultados</button>';
  html += '</div>';
  return html;
}

function renderAdminControl() {
  const names = Object.keys(APP.players);
  const locked = APP.settings.locked;

  let html = '<div class="space-y-4">';

  // Bloqueo de predicciones
  html += '<div class="bg-card border border-border rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-4">Bloqueo de Predicciones</h3>' +
    '<div class="flex items-center justify-between">' +
      '<div><p class="text-sm text-txt">Estado actual</p>' +
        '<p class="text-xs text-muted mt-0.5">' + (locked ? 'Los jugadores no pueden modificar sus marcadores' : 'Los jugadores pueden guardar y editar sus marcadores') + '</p></div>' +
      '<div class="toggle-switch' + (locked ? ' on' : '') + '" onclick="toggleLock()" role="switch" aria-checked="' + locked + '" tabindex="0" aria-label="Bloquear predicciones"></div>' +
    '</div></div>';

  // Cambiar PIN
  html += '<div class="bg-card border border-border rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-4">PIN de Administrador</h3>' +
    '<div class="flex gap-3 items-end">' +
      '<div class="flex-1"><label class="text-xs text-muted mb-1 block">Nuevo PIN</label>' +
        '<input type="password" id="new-pin" maxlength="6" placeholder="Nuevo PIN" ' +
          'class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-txt outline-none focus:border-gold transition-all" autocomplete="off"></div>' +
      '<button onclick="changePin()" class="btn-outline text-sm">Cambiar</button>' +
    '</div></div>';

  // Jugadores registrados
  html += '<div class="bg-card border border-border rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-txt mb-1">Jugadores Registrados</h3>' +
    '<p class="text-muted text-xs mb-4">' + names.length + ' de ~10 jugadores</p>';

  if (names.length === 0) {
    html += '<p class="text-muted text-sm">Aun no hay jugadores</p>';
  } else {
    html += '<div class="space-y-2">';
    names.forEach(name => {
      const player = APP.players[name];
      const predCount = Object.values(player.predictions).filter(p => p && p.home !== '' && p.away !== '').length;
      html += '<div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface/50">' +
        '<div class="flex items-center gap-3">' +
          '<div class="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center"><i class="fas fa-user text-gold text-xs"></i></div>' +
          '<div><p class="text-sm font-semibold text-txt">' + escHtml(name) + '</p>' +
            '<p class="text-xs text-muted">' + predCount + ' predicciones' +
            (player.savedAt ? ' &mdash; ' + new Date(player.savedAt).toLocaleString('es') : '') +
          '</p></div></div>' +
        '<button onclick="removePlayer(\'' + escAttr(name) + '\')" class="text-danger/40 hover:text-danger transition-colors cursor-pointer bg-transparent border-none text-sm" title="Eliminar jugador"><i class="fas fa-trash-can"></i></button>' +
      '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // Zona peligrosa
  html += '<div class="bg-card border border-danger/20 rounded-xl p-5">' +
    '<h3 class="font-display text-lg font-bold text-danger mb-1">Zona Peligrosa</h3>' +
    '<p class="text-muted text-xs mb-4">Estas acciones no se pueden deshacer</p>' +
    '<div class="flex flex-wrap gap-3">' +
      '<button onclick="confirmResetResults()" class="btn-danger text-sm"><i class="fas fa-eraser mr-1"></i>Borrar Resultados</button>' +
      '<button onclick="confirmResetPredictions()" class="btn-danger text-sm"><i class="fas fa-broom mr-1"></i>Borrar Predicciones</button>' +
      '<button onclick="confirmResetAll()" class="btn-danger text-sm"><i class="fas fa-bomb mr-1"></i>Resetear Todo</button>' +
    '</div></div>';

  html += '</div>';
  return html;
}

function setAdminTab(tab) {
  APP.adminTab = tab;
  renderAdmin();
}

// ============================================================
// ACCIONES DE ADMIN
// ============================================================

function updateTeam(matchId, side, value) {
  const match = APP.settings.matches.find(m => m.id === matchId);
  if (!match) return;
  if (side === 'home') match.homeTeam = value.trim();
  else match.awayTeam = value.trim();
  saveSettings();
  showToast('Equipo actualizado', 'success');
}

function saveResults() {
  let changed = false;
  APP.settings.matches.forEach(m => {
    const homeInput = document.getElementById('result-home-' + m.id);
    const awayInput = document.getElementById('result-away-' + m.id);
    if (!homeInput || !awayInput) return;

    const h = homeInput.value.trim();
    const a = awayInput.value.trim();

    if (h === '' && a === '') {
      if (m.homeResult !== null) { m.homeResult = null; m.awayResult = null; changed = true; }
      return;
    }

    if (h === '' || a === '') {
      showToast('Completa ambos marcadores del Partido ' + m.id, 'error');
      return;
    }

    const hv = parseInt(h);
    const av = parseInt(a);
    if (isNaN(hv) || isNaN(av) || hv < 0 || av < 0) {
      showToast('Marcadores invalidos en Partido ' + m.id, 'error');
      return;
    }

    if (m.homeResult !== hv || m.awayResult !== av) {
      m.homeResult = hv;
      m.awayResult = av;
      changed = true;
    }
  });

  if (changed) {
    saveSettings();
    showToast('Resultados guardados', 'success');
    renderAdmin();
  } else {
    showToast('No hubieron cambios', 'info');
  }
}

function clearResult(matchId) {
  const match = APP.settings.matches.find(m => m.id === matchId);
  if (!match) return;
  match.homeResult = null;
  match.awayResult = null;
  saveSettings();
  showToast('Resultado del Partido ' + matchId + ' eliminado', 'info');
  renderAdmin();
}

function toggleLock() {
  APP.settings.locked = !APP.settings.locked;
  saveSettings();
  showToast(APP.settings.locked ? 'Predicciones cerradas' : 'Predicciones abiertas', APP.settings.locked ? 'error' : 'success');
  renderAdmin();
}

function changePin() {
  const input = document.getElementById('new-pin');
  const newPin = input ? input.value.trim() : '';
  if (!newPin || newPin.length < 3) {
    showToast('El PIN debe tener al menos 3 caracteres', 'error');
    return;
  }
  APP.settings.adminPin = newPin;
  saveSettings();
  input.value = '';
  showToast('PIN actualizado correctamente', 'success');
}

function removePlayer(name) {
  showConfirm('Eliminar Jugador', 'Se eliminaran todas las predicciones de ' + name + '. Esta accion no se puede deshacer.', function() {
    delete APP.players[name];
    savePlayers();
    showToast('Jugador eliminado', 'info');
    renderAdmin();
  });
}

function confirmResetResults() {
  showConfirm('Borrar Resultados', 'Se eliminaran todos los resultados reales ingresados. Las predicciones de los jugadores se mantendran.', function() {
    APP.settings.matches.forEach(m => { m.homeResult = null; m.awayResult = null; });
    saveSettings();
    showToast('Todos los resultados han sido eliminados', 'info');
    renderAdmin();
  });
}

function confirmResetPredictions() {
  showConfirm('Borrar Predicciones', 'Se eliminaran todas las predicciones de todos los jugadores. Los resultados reales y la configuracion se mantendran.', function() {
    Object.keys(APP.players).forEach(name => {
      APP.players[name].predictions = {};
      APP.players[name].savedAt = null;
    });
    savePlayers();
    showToast('Todas las predicciones han sido eliminadas', 'info');
    renderAdmin();
  });
}

function confirmResetAll() {
  showConfirm('Resetear Todo', 'Se eliminara TODA la informacion: jugadores, predicciones, resultados y configuracion. La app volvera a su estado inicial.', function() {
    localStorage.removeItem(STORAGE_SETTINGS);
    localStorage.removeItem(STORAGE_PLAYERS);
    APP.settings = getDefaultSettings();
    APP.players = {};
    saveSettings();
    savePlayers();
    showToast('Todo ha sido reseteado', 'info');
    renderAdmin();
  });
}

// ============================================================
// MODALES
// ============================================================

let pinCallback = null;

function openPinModal(callback) {
  pinCallback = callback || null;
  document.getElementById('pin-input').value = '';
  document.getElementById('modal-pin').classList.add('active');
  setTimeout(() => document.getElementById('pin-input').focus(), 100);
}

function closePinModal() {
  document.getElementById('modal-pin').classList.remove('active');
  pinCallback = null;
}

function verifyPin() {
  const input = document.getElementById('pin-input');
  const pin = input.value.trim();
  if (pin === APP.settings.adminPin) {
    APP.isAdmin = true;
    sessionStorage.setItem(SESSION_ADMIN, 'true');
    closePinModal();
    showToast('Acceso de administrador concedido', 'success');
    if (pinCallback) pinCallback();
    else navigateTo('admin');
  } else {
    showToast('PIN incorrecto', 'error');
    input.value = '';
    input.focus();
  }
}

let confirmCallback = null;

function showConfirm(title, msg, callback) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  confirmCallback = callback;
  document.getElementById('modal-confirm').classList.add('active');
}

function closeConfirmModal() {
  document.getElementById('modal-confirm').classList.remove('active');
  confirmCallback = null;
}

document.getElementById('confirm-btn').addEventListener('click', function() {
  if (confirmCallback) confirmCallback();
  closeConfirmModal();
});

// ============================================================
// TOAST
// ============================================================

function showToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toast-container');
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  var iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = '<i class="fas ' + (iconMap[type] || iconMap.info) + '"></i><span>' + escHtml(message) + '</span>';
  container.appendChild(toast);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { toast.classList.add('show'); });
  });
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// ============================================================
// UTILIDADES
// ============================================================

function escHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// EVENTOS GLOBALES
// ============================================================

// Enter en login
document.getElementById('login-name').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleLogin();
});

// Enter en PIN
document.getElementById('pin-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') verifyPin();
});

// Cerrar modales con Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closePinModal();
    closeConfirmModal();
  }
});

// Cerrar modal al clicar fuera
document.getElementById('modal-pin').addEventListener('click', function(e) {
  if (e.target === this) closePinModal();
});
document.getElementById('modal-confirm').addEventListener('click', function(e) {
  if (e.target === this) closeConfirmModal();
});

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function() {});
}

// ============================================================
// INICIALIZACION
// ============================================================

loadState();

if (APP.currentPlayer && APP.players[APP.currentPlayer]) {
  // Sesión activa: mostrar la app directamente
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('app-main').style.display = 'block';
  document.getElementById('sidebar-username').textContent = APP.currentPlayer;
  navigateTo('predictions');
} else {
  // Sin sesión: mostrar login
  APP.currentPlayer = null;
  sessionStorage.removeItem(SESSION_PLAYER);
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('app-main').style.display = 'none';
}
<\/script>
</body>
</html>`;

// ============================================================
// HANDLER DEL WORKER
// ============================================================

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Manifest PWA
    if (url.pathname === '/manifest.json') {
      return new Response(MANIFEST, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // Service Worker
    if (url.pathname === '/sw.js') {
      return new Response(SW, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // HTML principal (cualquier otra ruta)
    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};