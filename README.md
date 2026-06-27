# ⚽ Quiniela Mundial FIFA 2026 — Ronda de 32

PWA para realizar pronósticos de los 16 partidos de la Ronda de 32 (28 Jun – 3 Jul 2026).

## Funciones
- 📅 Los 16 partidos reales con fechas, horas y estadios
- 🎯 Pronóstico de marcador por partido
- 🏆 Tabla de posiciones entre los participantes
- 🔧 Vista de admin para ingresar resultados reales
- 📋 Reglas y sistema de puntos (3 pts exacto, 1 pt ganador)
- 📱 Funciona offline (PWA instalable)

## Deploy en Cloudflare Pages

### Opción A — GitHub + Cloudflare (recomendado)

1. **Subir a GitHub:**
```bash
git init
git add .
git commit -m "Quiniela Mundial 2026 🏆"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/quiniela-mundial-2026.git
git push -u origin main
```

2. **Conectar con Cloudflare Pages:**
   - Ve a https://pages.cloudflare.com
   - "Create a project" → "Connect to Git"
   - Selecciona tu repo `quiniela-mundial-2026`
   - Build settings: **Framework preset: None**
   - Build command: *(vacío)*
   - Output directory: `/` (raíz)
   - Deploy!

3. **Compartir el link** con tus 12 participantes 🎉

### Opción B — Subida directa (sin GitHub)
- En Cloudflare Pages → "Create a project" → "Direct Upload"
- Sube la carpeta completa del proyecto

## Estructura
```
quiniela-mundial-2026/
├── index.html        ← App completa
├── manifest.json     ← Config PWA
├── sw.js             ← Service worker (offline)
├── _headers          ← Headers Cloudflare
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Cómo funciona
- Los datos de cada jugador se guardan en **localStorage** del navegador
- Para una tabla compartida real entre 12 personas, todos deben usar el mismo dispositivo o coordinarse manualmente (el admin ingresa los picks de todos)
- El admin ingresa los resultados reales → los puntos se calculan automáticamente

## Sistema de puntos
| Pronóstico | Puntos |
|-----------|--------|
| Marcador exacto | 3 pts |
| Ganador correcto | 1 pt |
| Incorrecto | 0 pts |
