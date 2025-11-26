// registerPush.js
export const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
  
  export const registerPush = async (usuarioId) => {
    if (!("serviceWorker" in navigator)) return;
  
    try {
      const sw = await navigator.serviceWorker.register("/service-worker.js");
      await navigator.serviceWorker.ready;
  
      const existingSub = await sw.pushManager.getSubscription();
  
      const applicationServerKey = urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      );
  
      const subscription = existingSub || await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
  
      const rawP256dh = subscription.getKey("p256dh");
      const rawAuth = subscription.getKey("auth");
  
      const p256dh = rawP256dh ? btoa(String.fromCharCode(...new Uint8Array(rawP256dh))) : null;
      const auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : null;
  
      await fetch(`${import.meta.env.VITE_API_URL}/save-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioId,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
        }),
      });
  
    } catch (err) {
      // opcional: manejar error si quieres
    }
  };
  
  // Función opcional para desuscribirse manualmente
  export const unsubscribePush = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
    }
  };
  