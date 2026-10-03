const CACHE_NAME = "vt-dairy-v4";

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

self.addEventListener("install", function(event){

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(function(cache){

        return cache.addAll(FILES_TO_CACHE);

      })

  );

  self.skipWaiting();

});


/* =================================
   ACTIVATE
================================= */

self.addEventListener("activate", function(event){

  event.waitUntil(

    caches.keys()

      .then(function(cacheNames){

        return Promise.all(

          cacheNames.map(function(cacheName){

            if(cacheName !== CACHE_NAME){

              return caches.delete(cacheName);

            }

          })

        );

      })

  );

  self.clients.claim();

});


/* =================================
   FETCH
================================= */

self.addEventListener("fetch", function(event){

  event.respondWith(

    fetch(event.request)

      .then(function(response){

        return response;

      })

      .catch(function(){

        return caches.match(event.request)

          .then(function(cachedResponse){

            if(cachedResponse){

              return cachedResponse;

            }

            return caches.match("./index.html");

          });

      })

  );

});


/* =================================
   PUSH NOTIFICATION
================================= */

self.addEventListener("push", function(event){

  let data = {};

  try{

    if(event.data){

      data = event.data.json();

    }

  }catch(error){

    console.error(
      "Push data error:",
      error
    );

  }


  const title =
    data.title ||
    "VT Dairy Farm";


  const options = {

    body:
      data.body ||
      "VT Dairy Farm की नई Notification है।",

    icon:
      data.icon ||
      "./icon-192.png",

    badge:
      data.badge ||
      "./icon-192.png",

    data:
      data.data ||
      {},

    tag:
      data.tag ||
      "vt-dairy-notification",

    renotify:true

  };


  event.waitUntil(

    self.registration.showNotification(
      title,
      options
    )

  );

});


/* =================================
   NOTIFICATION CLICK
================================= */

self.addEventListener(
  "notificationclick",
  function(event){

    event.notification.close();


    event.waitUntil(

      clients.matchAll({

        type:"window",

        includeUncontrolled:true

      })

      .then(function(clientList){

        for(
          const client of clientList
        ){

          if(
            "focus" in client
          ){

            return client.focus();

          }

        }


        if(
          clients.openWindow
        ){

          return clients.openWindow(
            "./"
          );

        }

      })

    );

  }
);
