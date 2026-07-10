var CACHE_NAME = "gym-tracker-v2";
var ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./seed-data.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Network-first: always try to fetch the latest deployed files first, so a
// new push shows up on next load without needing a cache-version bump. Only
// fall back to the cache when there's no network (offline use).
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      return resp;
    }).catch(function () {
      return caches.match(event.request);
    })
  );
});
