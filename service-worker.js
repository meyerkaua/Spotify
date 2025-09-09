const CACHE_NAME = "meuapp-v1";
const FILES_TO_CACHE = [
  "index.html",
  "style.css",
  "script.js",
  "icone.png"
];

// Instala e salva os arquivos no cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  console.log("Service Worker instalado");
});

// Ativa e remove caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  console.log("Service Worker ativo");
});

// Busca os arquivos no cache primeiro
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
