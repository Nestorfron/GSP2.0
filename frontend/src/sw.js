// Importa Workbox para precache
import { precacheAndRoute } from 'workbox-precaching';

// ========================
// Precache manifest inyectado por Workbox
// ========================
precacheAndRoute(self.__WB_MANIFEST || []);

// ========================
// Push notifications
// ========================
self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let data = { title: "Notificación", body: "" };

    if (event.data) {
      try {
        data = event.data.json();
      } catch {
        data.body = await event.data.text();
      }
    }

    // Enviar al cliente activo
    const allClients = await clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    });

    allClients.forEach((client) => {
      client.postMessage({
        type: "PUSH_RECEIVED",
        payload: data,
      });
    });

    // Mostrar notificación
    await self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      vibrate: [100, 50, 100],
      data,
    });
  })());
});
