const CACHE_NAME = 'quiniela-v4';

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
  var url = e.request.url;

  // iOS Safari fix: always pass through non-GET, supabase, and external CDN requests
  // Returning nothing (undefined) from respondWith causes iOS to hang/blank
  if (
    e.request.method !== 'GET' ||
    url.includes('supabase.co') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('cdn.tailwindcss.com') ||
    url.includes('cdn.jsdelivr.net') ||
    url.includes('cdnjs.cloudflare.com')
  ) {
    // Let these go straight to network - don't call respondWith at all
    return;
  }

  // Network First strategy for same-origin assets
  e.respondWith(
    fetch(e.request).then(function(resp) {
      if (resp && resp.status === 200) {
        var c = resp.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, c);
        });
      }
      return resp;
    }).catch(function() {
      return caches.match(e.request).then(function(r) {
        if (r) return r;
        if (e.request.destination === 'document') {
          return caches.match('/');
        }
        // iOS fix: return a proper 503 instead of undefined
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
