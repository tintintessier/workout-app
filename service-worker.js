const CACHE_NAME = 'train7k-v1';
const URLS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './data/seances.json',
  './data/force.json',
  // ajoute ici tes icônes et assets nécessaires
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
