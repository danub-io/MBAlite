// sw.js

const CACHE_NAME = 'mbalite-cache-v2'; // Mude a versão se fizer alterações futuras
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icones.css',
  '/dist/output.css',
  '/src/aos.js',
  '/src/aos.css',
  '/img/fav.png',
  '/img/profile-pic.webp',
  '/img/svg/hero1.svg',
  '/img/svg/hero2.svg',
  '/img/svg/hero3.svg',
  '/img/svg/hero4.svg',
  '/img/ebooks/gestao-de-pessoas-alta-performance.webp'
  // Adicione aqui outros arquivos estáticos que você queira cachear
];

const MAX_AGE_SECONDS = 31536000; // 1 ano

// Instala o Service Worker e armazena os assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Intercepta as requisições (estratégia Stale-While-Revalidate)
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignora requisições de outras origens (ex: convertkit)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(request).then(cachedResponse => {
        // Tenta buscar da rede em segundo plano
        const fetchPromise = fetch(request).then(networkResponse => {
          // Se a busca for bem-sucedida, atualiza o cache
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Retorna a resposta do cache imediatamente, se houver.
        // Se não, espera a resposta da rede.
        return cachedResponse || fetchPromise;
      });
    })
  );
});