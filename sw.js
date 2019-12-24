self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('toupac-v1')
    .then(cache => cache.addAll([]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => response ? response : fetch(event.request))
  );
});
