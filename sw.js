// Service worker do Recadinho Térmico
// Busca sempre a versão mais nova na internet; sem internet, usa a cópia salva.
// Todos os arquivos são locais (nada depende de site externo).
const CACHE = 'recadinho-v2';
const ARQUIVOS = [
  './recadinho.html',
  './manifest.json',
  './qrcode.js',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', ev => {
  // Salva cada arquivo separadamente: se um falhar, os outros continuam salvos.
  ev.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(ARQUIVOS.map(url =>
        fetch(url, { cache: 'no-cache' }).then(resp => { if (resp.ok) return c.put(url, resp); })
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request)
      .then(resp => {
        if (resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(ev.request, { ignoreSearch: true }))
  );
});
