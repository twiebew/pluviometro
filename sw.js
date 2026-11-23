/* Service worker – Registro Pluviométrico
   Guarda la aplicación para uso sin conexión. Nunca toca los datos del usuario (IndexedDB). */
const VERSION = 'pluvio-1.1.1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pluvio-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'activar') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // APIs externas: siempre en línea
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => { if (resp.ok) { const copia = resp.clone(); caches.open(VERSION).then(c => c.put(req, copia)); } return resp; })));
});
