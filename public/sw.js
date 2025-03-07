// public/sw.js

const CACHE_NAME = 'children-timer-cache-v1';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  // Ativa o service worker imediatamente, sem esperar que os outros sejam encerrados
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/clock.png'
      ]);
    })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  // Assume o controle de todas as páginas imediatamente
  event.waitUntil(clients.claim());
  
  // Limpa caches antigos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Intercepta requisições de rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Gerencia notificações
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Notificação' };
  
  const title = data.title || 'Notificação';
  const options = {
    body: data.body || '',
    icon: data.icon || '/clock.png',
    badge: data.badge || '/clock.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manipula cliques na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Abre a aplicação quando a notificação é clicada
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});