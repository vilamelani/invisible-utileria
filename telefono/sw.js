// Service worker: deja toda la app disponible sin conexión.
// Subí VERSION cada vez que publiques cambios para que los celulares bajen la versión nueva.
const VERSION = 'invisible-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/icons.js',
  './js/media.js',
  './js/menu.js',
  './contenido/guion.json',
  './iconos/icono-180.png',
  './iconos/icono-192.png',
  './iconos/icono-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      const copia = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copia));
      return res;
    }))
  );
});
