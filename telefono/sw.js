// Service worker: deja toda la app disponible sin conexión.
// Subí VERSION cada vez que publiques cambios para que los celulares bajen la versión nueva.
const VERSION = 'invisible-v4';
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
  './iconos/icono-512.png',
  './contenido/default/av-agustina.jpg',
  './contenido/default/av-cami.jpg',
  './contenido/default/av-flor.jpg',
  './contenido/default/av-julian.jpg',
  './contenido/default/av-lu.jpg',
  './contenido/default/av-martina.jpg',
  './contenido/default/av-tomi.jpg',
  './contenido/default/post1.jpg',
  './contenido/default/post2.jpg',
  './contenido/default/st-atardecer.jpg',
  './contenido/default/st-fiesta.jpg',
  './contenido/default/st-julian.jpg',
  './contenido/default/st-recital.jpg',
  './fuentes/marca.woff2'
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

// Con conexión: siempre la versión más nueva (y se guarda). Sin conexión (modo avión en el set): la guardada.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && res.ok) {
        const copia = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
