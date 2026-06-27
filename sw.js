const CACHE_NAME = 'quiniela-v3';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Ignorar las peticiones a Supabase para que siempre vayan a la red sin pasar por caché
  if (e.request.url.includes('supabase.co')) {
    return;
  }

  // Estrategia Network First, fallback a Cache
  e.respondWith(
    fetch(e.request).then(function(resp) {
      if (resp.status === 200 && e.request.method === 'GET') {
        var c = resp.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, c);
        });
      }
      return resp;
    }).catch(function() {
      return caches.match(e.request).then(function(r) {
        if (r) return r;
        // Si es una navegación y falla, devolvemos la raíz si está en caché (para PWA offline)
        if (e.request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});