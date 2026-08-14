// Service worker voor Türkçe Yolculuk — maakt de app expliciet offline beschikbaar.
// CACHE_VERSION ophogen bij elke nieuwe versie van index.html die je in GitHub zet,
// zodat oude, ge-cachte versies automatisch opgeruimd worden.
const CACHE_VERSION = "v1";
const CACHE_NAME = `turkce-yolculuk-${CACHE_VERSION}`;
const APP_SHELL = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Netwerk-eerst, met terugval op de cache: je krijgt de nieuwste versie zodra je
// online bent, en de laatst opgeslagen versie zodra je offline bent.
self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
