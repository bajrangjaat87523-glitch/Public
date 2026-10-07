importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);


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


/*
  Background Notification
*/

messaging.onBackgroundMessage(
  function(payload){

    console.log(
      "[firebase-messaging-sw.js] Background message:",
      payload
    );


    const notification =
      payload.notification || {};


    const title =
      notification.title ||
      "🚚 VT Dairy Farm";


    const options = {

      body:
        notification.body ||
        "आपको नया Delivery Order मिला है।",

      icon:
        "./icon-192.png",

      badge:
        "./icon-192.png",

      data:
        payload.data || {}

    };


    self.registration.showNotification(
      title,
      options
    );

  }
);


/*
  Notification Click
*/

self.addEventListener(
  "notificationclick",
  function(event){

    event.notification.close();


    const targetUrl =
      event.notification?.data?.url ||
      "./delivery.html";


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
            client.url.includes(
              "delivery.html"
            ) &&
            "focus" in client
          ){

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
