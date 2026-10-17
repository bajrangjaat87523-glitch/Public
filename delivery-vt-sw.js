const CACHE_NAME = "delivery-vt-cache-v1";

const FILES_TO_CACHE = [
"./delivery-vt.html",
"./delivery-vt-manifest.json",
"./icon-192.png",
"./icon-512.png"
];

self.addEventListener("install", function(event) {
event.waitUntil(
caches.open(CACHE_NAME)
.then(function(cache) {
return cache.addAll(FILES_TO_CACHE);
})
.then(function() {
return self.skipWaiting();
})
);
});

self.addEventListener("activate", function(event) {
event.waitUntil(
caches.keys().then(function(cacheNames) {
return Promise.all(
cacheNames
.filter(function(cacheName) {
return cacheName.startsWith("delivery-vt-cache-")
&& cacheName !== CACHE_NAME;
})
.map(function(cacheName) {
return caches.delete(cacheName);
})
);
}).then(function() {
return self.clients.claim();
})
);
});

self.addEventListener("fetch", function(event) {
if (event.request.method !== "GET") {
return;
}

const url = new URL(event.request.url);

if (url.origin !== self.location.origin) {
return;
}

event.respondWith(
fetch(event.request)
.then(function(response) {
if (response && response.ok) {
const responseCopy = response.clone();

      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, responseCopy);
      });
    }

    return response;
  })
  .catch(function() {
    return caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      if (event.request.mode === "navigate") {
        return caches.match("./delivery-vt.html");
      }

      return new Response("इंटरनेट उपलब्ध नहीं है।", {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      });
    });
  })

);
});
