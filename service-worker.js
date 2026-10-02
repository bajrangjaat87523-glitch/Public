const CACHE_NAME = "vt-dairy-v3";

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

  );

  self.skipWaiting();

});


/* =================================
   ACTIVATE
================================= */

self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches.keys()

      .then(function(cacheNames) {

        return Promise.all(

          cacheNames

            .filter(function(name) {

              return name !== CACHE_NAME;

            })

            .map(function(name) {

              return caches.delete(name);

            })

        );

      })

  );

  self.clients.claim();

});


/* =================================
   FETCH
================================= */

self.addEventListener("fetch", function(event) {

  event.respondWith(

    fetch(event.request)

      .then(function(response) {

        return response;

      })

      .catch(function() {

        return caches.match(event.request);

      })

  );

});


/* =================================
   FIREBASE CLOUD MESSAGING
================================= */

/*
   Firebase Messaging background
   notifications के लिए Firebase SDK
*/

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);


/* =================================
   FIREBASE CONFIG
================================= */

firebase.initializeApp({

  apiKey:
    "AIzaSyD9cwaW54d5VRfK6rbuqSExcz27bFHdSm8",

  authDomain:
    "vt-dairy-farm-9afc8.firebaseapp.com",

  projectId:
    "vt-dairy-farm-9afc8",

  storageBucket:
    "vt-dairy-farm-9afc8.firebasestorage.app",

  messagingSenderId:
    "86012601125",

  appId:
    "1:86012601125:web:6a6d81f5d93aae16a030cc"

});


const messaging =
  firebase.messaging();


/* =================================
   BACKGROUND MESSAGE
================================= */

messaging.onBackgroundMessage(
  function(payload) {

    console.log(
      "Firebase background message:",
      payload
    );


    const notification =
      payload.notification || {};


    const title =
      notification.title ||
      "VT Dairy Farm";


    const body =
      notification.body ||
      "VT Dairy Farm में नया अपडेट है।";


    const notificationOptions = {

      body: body,

      icon: "./icon-192.png",

      badge: "./icon-192.png",

      data:
        payload.data || {},

      tag:
        payload.data &&
        payload.data.orderId

          ?

          "vt-dairy-order-" +
          payload.data.orderId

          :

          "vt-dairy-notification",

      renotify: true

    };


    return self.registration.showNotification(
      title,
      notificationOptions
    );

  }
);


/* =================================
   NOTIFICATION CLICK
================================= */

self.addEventListener(
  "notificationclick",
  function(event) {

    event.notification.close();


    const data =
      event.notification.data || {};


    let targetUrl =
      "./index.html";


    if(data.url){

      targetUrl =
        data.url;

    }


    event.waitUntil(

      clients.matchAll({

        type: "window",

        includeUncontrolled: true

      })

      .then(function(clientList) {

        for(
          const client of clientList
        ){

          if(
            "focus" in client
          ){

            client.navigate(
              targetUrl
            );

            return client.focus();

          }

        }


        if(
          clients.openWindow
        ){

          return clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);
