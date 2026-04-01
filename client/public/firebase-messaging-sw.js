import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// This is a placeholder since the SW needs to be self-contained or use importScripts
// Usually we use importScripts for firebase-app and firebase-messaging
// or bundle it if using a complex worker setup.
// Given this is a simple Vite project, we'll use the CDN version.

/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "REPLACEME",
    authDomain: "REPLACEME",
    projectId: "REPLACEME",
    storageBucket: "REPLACEME",
    messagingSenderId: "REPLACEME",
    appId: "REPLACEME",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
