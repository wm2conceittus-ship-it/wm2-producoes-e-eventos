importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase App in service worker context
firebase.initializeApp({
  projectId: "app-conceittus-formaturas",
  appId: "1:1018278227340:web:438a6362942464b42ffaa9",
  apiKey: "AIzaSyB7ZnT2CT4172nIQ3XvGgMB13utwkUOfYM",
  authDomain: "app-conceittus-formaturas.firebaseapp.com",
  storageBucket: "app-conceittus-formaturas.firebasestorage.app",
  messagingSenderId: "1018278227340"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Novo Aviso Importante!';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Acesse seu portal do formando para conferir as novidades.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
