// Service worker: deja la app de la Mac disponible sin conexión.
// Subí VERSION cada vez que publiques cambios.
const VERSION = 'invisible-mac-v2';
const ARCHIVOS = [
  './', './index.html', './manifest.webmanifest', './css/mac.css',
  './js/mac.js', './js/menu.js', './js/media.js', './js/esc3.js', './contenido/mac.json',
  './iconos/icono-180.png', './iconos/icono-192.png', './iconos/icono-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && res.ok) { const c = res.clone(); caches.open(VERSION).then((x) => x.put(e.request, c)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
