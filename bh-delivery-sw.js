const CACHE_NAME = "bh-delivery-cache-v2";

const FILES_TO_CACHE = [
"./bh-delivery.html",
"./bh-delivery-manifest.json",
"./bh-icon-192.png",
"./bh-icon-512.png"
];

self.addEventListener("install", event => {
event.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
);
self.skipWaiting();
});

self.addEventListener("activate", event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(
keys
.filter(key =>
key.startsWith("bh-delivery-cache-") &&
key !== CACHE_NAME
)
.map(key => caches.delete(key))
)
).then(() => self.clients.claim())
);
});

self.addEventListener("fetch", event => {
if (event.request.method !== "GET") return;

const url = new URL(event.request.url);
if (url.origin !== self.location.origin) return;

event.respondWith(
fetch(event.request).then(response => {
if (response && response.ok) {
const copy = response.clone();
caches.open(CACHE_NAME).then(cache => {
cache.put(event.request, copy);
});
}
return response;
}).catch(() => caches.match(event.request))
);
});
