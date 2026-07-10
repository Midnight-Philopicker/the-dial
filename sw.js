/* DialHub / THE DIAL — offline service worker. Created by Isaac Hashman (Midnight Philopicker). */
const CACHE = 'thedial-v93';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './icon-180.png',
  './icon-dialhub-192.png', './icon-dialhub-512.png', './icon-dialhub-512-maskable.png', './icon-dialhub-180.png','./logo-dial.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return; // let Firebase/CDN pass through
  e.respondWith(
    caches.match(req).then(hit =>
      hit || fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match('./');
        return new Response('', { status: 504, statusText: 'offline' });
      })
    )
  );
});
