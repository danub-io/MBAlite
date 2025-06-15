// Exemplo conceitual de sw.js
const CACHE_NAME = 'mbalite-cache-v1';
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  '/dist/output.css',
  '/src/aos.js',
  '/img/svg/hero1.svg',
  // Adicione todos os outros recursos estáticos importantes
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso estiver no cache, retorna ele.
        if (response) {
          return response;
        }
        // Senão, busca na rede.
        return fetch(event.request);
      }
    )
  );
});