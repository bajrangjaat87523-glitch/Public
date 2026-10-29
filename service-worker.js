"use strict";

const CACHE_NAME = "vt-dairy-customer-v3";

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

          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(function(cache) {
                return cache.put(request, responseCopy);
              })
              .catch(function(error) {
                console.warn("Cache save failed:", error);
              })
          );
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
                    "ऑफलाइन हैं। Internet कनेक्शन जाँचें।",
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

    if (event.data) {
      data = {
        body: event.data.text()
      };
    }
  }

  const title = data.title || "🥛 VT Dairy Farm";
  const notificationData = data.data || {};

  const options = {
    body: data.body || "आपके ऑर्डर की नई जानकारी उपलब्ध है।",
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
   सही Customer App पेज खोलें
================================= */

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetURL;

  try {
    targetURL = new URL(
      notificationData.url || "./index.html",
      self.registration.scope
    );
  } catch (error) {
    targetURL = new URL("./index.html", self.registration.scope);
  }

  if (targetURL.origin !== self.location.origin) {
    return;
  }

  // Customer App के scope से बाहर जाने से रोकें।
  const appScope = new URL(self.registration.scope);

  if (!targetURL.pathname.startsWith(appScope.pathname)) {
    targetURL = new URL("./index.html", self.registration.scope);
  }

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(function(clientList) {
      for (const client of clientList) {
        const clientURL = new URL(client.url);

        if (
          clientURL.origin === targetURL.origin &&
          clientURL.pathname.startsWith(appScope.pathname) &&
          "navigate" in client &&
          "focus" in client
        ) {
          return client.navigate(targetURL.href)
            .then(function(navigatedClient) {
              return (navigatedClient || client).focus();
            });
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetURL.href);
      }
    })
  );
});
