self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        if (resp.status === 200) {
          var c = resp.clone();
          caches.open('quiniela-v3').then(function(cache) {
            cache.put(e.request, c);
          });
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
