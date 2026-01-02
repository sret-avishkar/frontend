importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "REPLACE_WITH_YOUR_API_KEY", // Will need to be replaced with real values content or loaded dynamically? SW has limited access. 
    // Typically we hardcode or use a build step. For now, I will assume typical firebase config.
    // Wait, I cannot access process.env here easily without build step injection.
    // I will use a placeholder and ask user to check, or try to infer. 
    // Actually, for simplicity in "dev" mode, I might skip exact config if not strictly needed for basic background message display which often works with just messagingSenderId?
    // No, initializeApp is required.
    // I will read the client/src/firebase.js to see values, but better to use a placeholder 
    // and hopefully the user has a way to inject or I will just paste the values if I see them in .env?
    // Let's check .env values first in next step if this fails or I'll try to find them.
    // I'll use a generic placeholder for now and then update it with sed/replace if I can read .env.
    apiKey: "YOUR_API_KEY", // Note: API Key is not strictly needed for messaging in SW if senderId is correct, but safer to include if known. I don't have it in the env output.
    authDomain: "sree-rama-avishkar.firebaseapp.com", // Inferring from bucket
    projectId: "sree-rama-avishkar",
    storageBucket: "sree-rama-avishkar.firebasestorage.app",
    messagingSenderId: "287911280982",
    appId: "1:287911280982:web:4351b4584e4b47125b16f7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png' // Ensure this exists or use default
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
