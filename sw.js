// SecurityAir Service Worker v1.0
const CACHE = 'securityair-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Peticiones al ESP32 -> siempre red (no cachear datos de sensores)
  if (!url.pathname.startsWith('/') || url.host !== self.location.host) {
    e.respondWith(fetch(e.request).catch(() =>
      new Response(JSON.stringify({ error: 'Sin conexión', listo: false }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // Archivos de la app -> cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
