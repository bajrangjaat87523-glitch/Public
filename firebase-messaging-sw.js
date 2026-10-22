importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
apiKey: "AIzaSyD9cwaW54d5VRfK6rbuqSExcz27bFHdSm8",
authDomain: "vt-dairy-farm-9afc8.firebaseapp.com",
projectId: "vt-dairy-farm-9afc8",
storageBucket: "vt-dairy-farm-9afc8.firebasestorage.app",
messagingSenderId: "86012601125",
appId: "1:86012601125:web:6a6d81f5d93aae16a030cc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
console.log("[firebase-messaging-sw.js] Background message:", payload);

const notification = payload.notification || {};
const data = payload.data || {};

const title = notification.title || "🥛 VT Dairy Farm";

const options = {
body: notification.body || "आपको VT Dairy Farm से नई सूचना मिली है।",
icon: "./icon-192.png",
badge: "./icon-192.png",
data: {
url: data.url || "./index.html"
}
};

return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function(event) {
event.notification.close();

const notificationData = event.notification.data || {};
const targetPath = notificationData.url || "./index.html";
const targetUrl = new URL(targetPath, self.location.href);

if (targetUrl.origin !== self.location.origin) {
return;
}

event.waitUntil(
clients.matchAll({
type: "window",
includeUncontrolled: true
}).then(function(clientList) {
for (const client of clientList) {
if (client.url === targetUrl.href && "focus" in client) {
return client.focus();
}
}

  if (clients.openWindow) {
    return clients.openWindow(targetUrl.href);
  }

  return undefined;
})

);
});
