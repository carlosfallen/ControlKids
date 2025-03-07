interface ServiceWorkerNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

// Registra o service worker
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/sw.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('ServiceWorker registrado com sucesso:', registration);
          requestNotificationPermission();
        })
        .catch(error => {
          console.error('Falha ao registrar ServiceWorker:', error);
        });
    });
  }
}

// Solicita permissão para notificações
export function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log('Permissão para notificações:', permission);
    });
  }
}

// Mostra uma notificação
export function showNotification(title: string, options: ServiceWorkerNotificationOptions = {}) {
  if (!('Notification' in window)) {
    console.log('Notificações não são suportadas neste navegador');
    return;
  }

  if (Notification.permission === 'granted') {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icon.png',
          vibrate: [200, 100, 200],
          ...options
        });
      });
    } else {
      new Notification(title, {
        ...options,
        vibrate: undefined
      });
    }
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification(title, options);
      }
    });
  }
}