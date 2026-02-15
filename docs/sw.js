const CACHE = 'weather-v3'; // change when updating assets

const ASSETS = [
  '/',
  '/index.html',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/lucide@0.454.0'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.startsWith(self.location.origin) ||
      e.request.url.includes('cdn.jsdelivr.net') ||
      e.request.url.includes('unpkg.com')) {
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => caches.match('/index.html'))
      )
    );
  } else {
    // API calls → network first, fallback message
    e.respondWith(
      fetch(e.request).catch(() => new Response('Offline – weather data unavailable', { status: 503 }))
    );
  }
});