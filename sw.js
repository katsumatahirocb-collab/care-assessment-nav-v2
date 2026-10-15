const CACHE = 'care-assessment-nav-v2-fixed';
const ASSETS = [
  './','./index.html','./app.html','./styles.css','./questions.js','./xlsx.js','./print.js','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(async c => { const keys = await c.keys(); if (!keys.length) await c.addAll(ASSETS); }))); // 固定版: 同一URL上でファイルが変わっても既存キャッシュを上書きしない
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
    const clone = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); return resp;
  }).catch(() => caches.match('./app.html'))));
});
