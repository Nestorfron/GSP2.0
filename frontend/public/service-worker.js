self.addEventListener("push", (event) => {
    event.waitUntil((async () => {
      let data = { title: "Notificación", body: "" };
  
      if (event.data) {
        try {
          data = event.data.json(); // si es JSON
        } catch (err) {
          data.body = await event.data.text(); // si es texto plano
        }
      }
  
      // Enviar al cliente activo
      const allClients = await clients.matchAll({ includeUncontrolled: true, type: "window" });
      allClients.forEach(client => {
        client.postMessage({ type: "PUSH_RECEIVED", payload: data });
      });
  
      // Mostrar notificación
      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: data,
      });
    })());
  });
  