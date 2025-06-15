// Define o nome e a versão do cache.
// Se você fizer alterações futuras nos arquivos, mude a versão (ex: 'mbalite-cache-v2').
const CACHE_NAME = 'mbalite-cache-v1';

// Lista dos arquivos essenciais que serão armazenados em cache.
const STATIC_ASSETS = [
  './',
  './index.html',
  './img/fav.png',
  './img/profile-pic.webp',
  './img/ebooks/gestao-de-pessoas-alta-performance.webp'
];

// Evento 'install': é disparado quando o Service Worker é instalado.
// Ele armazena os arquivos estáticos em cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto e arquivos estáticos sendo armazenados.');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Força o novo Service Worker a se tornar ativo.
  );
});

// Evento 'activate': é disparado quando o Service Worker é ativado.
// Ele limpa caches antigos que não estão mais em uso.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // Torna o Service Worker o controlador da página imediatamente.
  );
});

// Evento 'fetch': é disparado sempre que a página faz uma requisição de rede (ex: para uma imagem).
// Ele intercepta a requisição e serve o arquivo do cache se ele existir.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignora requisições que não são para o seu próprio site (ex: Google Fonts, ConvertKit).
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Estratégia "Stale-While-Revalidate":
  // 1. Responde rapidamente com o que estiver no cache.
  // 2. Em paralelo, busca uma nova versão na rede e atualiza o cache para a próxima visita.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(error => {
            console.error('Service Worker: Falha na busca de rede.', error);
            // Opcional: Você pode retornar uma página offline aqui se a busca falhar e não houver cache.
        });

        // Retorna a resposta do cache imediatamente se existir, ou espera a resposta da rede.
        return cachedResponse || fetchPromise;
      });
    })
  );
});
