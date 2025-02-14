importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');


firebase.initializeApp({
    apiKey: 'AIzaSyDtGefJtbg7cd82jS_troN1YxPFAUr7l8g',
  authDomain: 'kashbazzar-3350f.firebaseapp.com',
  projectId: 'kashbazzar-3350f',
  storageBucket: 'kashbazzar-3350f.firebasestorage.app',
  messagingSenderId: '322297992201',
  appId: '1:322297992201:web:4a1c1c0717bd93d34a54d8',
  measurementId: 'G-6ZWBD62C4C'
});

const messaging = firebase.messaging();

try {
    messaging.setBackgroundMessageHandler(function (payload) {
        let data = payload?.notification;
        const notificationTitle = data?.title;
        const notificationOptions = {
            body: data?.body,
            icon: './logo.png' || 0,
            image: data?.image
        };

        return self.registration.showNotification(notificationTitle,
            notificationOptions);
    });

} catch (error) {
    console.log("This is an error ->", error);
}
