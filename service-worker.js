"use strict";

const CACHE_NAME = "vt-dairy-customer-v2";

const FILES_TO_CACHE = [
"./",
"./index.html",
"./manifest.json",
"./icon-192.png",
"./icon-512.png"
];

/* =================================
INSTALL
================================= */

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

/* =================================
ACTIVATE
केवल Customer App के पुराने Cache हटाएँ
================================= */

self.addEventListener("activate", function(event) {
event.waitUntil(
caches.keys()
.then(function(cacheNames) {
return Promise.all(
cacheNames.map(function(cacheName) {
if (
cacheName.startsWith("vt-dairy-customer-") &&
cacheName !== CACHE_NAME
) {
return caches.delete(cacheName);
}
})
);
})
.then(function() {
return self.clients.claim();
})
);
});

/* =================================
FETCH
Network First
================================= */

self.addEventListener("fetch", function(event) {
const request = event.request;

if (request.method !== "GET") {
return;
}

const requestURL = new URL(request.url);

if (requestURL.origin !== self.location.origin) {
return;
}

event.respondWith(
fetch(request)
.then(function(response) {
if (
response &&
response.ok &&
response.type === "basic"
) {
const responseCopy = response.clone();

      caches.open(CACHE_NAME)
        .then(function(cache) {
          cache.put(request, responseCopy);
        })
        .catch(function(error) {
          console.warn("Cache save failed:", error);
        });
    }

    return response;
  })
  .catch(function() {
    return caches.match(request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        if (request.mode === "navigate") {
          return caches.match("./index.html")
            .then(function(indexResponse) {
              if (indexResponse) {
                return indexResponse;
              }

              return new Response(
                "Offline हैं। Internet कनेक्शन जाँचें।",
                {
                  status: 503,
                  headers: {
                    "Content-Type": "text/plain; charset=utf-8"
                  }
                }
              );
            });
        }

        return new Response(
          "यह फ़ाइल Offline उपलब्ध नहीं है।",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      });
  })

);
});

/* =================================
PUSH NOTIFICATION
================================= */

self.addEventListener("push", function(event) {
let data = {};

try {
if (event.data) {
data = event.data.json();
}
} catch (error) {
console.error("Push data error:", error);
}

const title = data.title || "🥛 VT Dairy Farm";

const notificationData = data.data || {};

const options = {
body: data.body || "आपके Order की नई जानकारी उपलब्ध है।",
icon: data.icon || "./icon-192.png",
badge: data.badge || "./icon-192.png",
data: notificationData,
tag: data.tag || "vt-dairy-customer-notification",
renotify: false
};

event.waitUntil(
self.registration.showNotification(title, options)
);
});

/* =================================
NOTIFICATION CLICK
================================= */

self.addEventListener("notificationclick", function(event) {
event.notification.close();

const notificationData = event.notification.data || {};

const targetURL = new URL(
notificationData.url || "./index.html",
self.location.href
);

if (targetURL.origin !== self.location.origin) {
return;
}

event.waitUntil(
self.clients.matchAll({
type: "window",
includeUncontrolled: true
}).then(function(clientList) {
for (const client of clientList) {
if (
client.url.startsWith(self.location.origin) &&
"focus" in client
) {
return client.focus();
}
}

  if (self.clients.openWindow) {
    return self.clients.openWindow(targetURL.href);
  }
})

);
});
