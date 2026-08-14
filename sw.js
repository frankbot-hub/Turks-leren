// Service worker voor Türkçe Yolculuk — maakt de app expliciet offline beschikbaar.
// CACHE_VERSION ophogen bij elke nieuwe versie van index.html die je in GitHub zet,
// zodat oude, ge-cachte versies automatisch opgeruimd worden.
const CACHE_VERSION = "v2";
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

// Stale-while-revalidate: toon meteen de opgeslagen versie (voelt instant aan),
// en haal ondertussen op de achtergrond de nieuwste versie op voor de volgende keer.
self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => cachedResponse || cache.match("./index.html"));
        return cachedResponse || networkFetch;
      })
    )
  );
});
