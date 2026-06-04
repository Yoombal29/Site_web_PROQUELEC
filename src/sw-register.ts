const isLocalDevHost = () => {
  const { hostname, port } = window.location;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    port === '5173' ||
    port === '5175'
  );
};

const SERVICE_WORKER_DISABLED = true;

const clearServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }
};

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;

  if (SERVICE_WORKER_DISABLED || isLocalDevHost()) {
    window.addEventListener('load', () => {
      clearServiceWorker().catch((error) => {
        console.warn('[ServiceWorker] Cleanup failed:', error);
      });
    });
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('[ServiceWorker] Registration failed:', error);
    });
  });
};

export const precacheCriticalNorms = () => {
  if (SERVICE_WORKER_DISABLED || isLocalDevHost()) return;

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'PRECACHE_CRITICAL_DATA'
    });
  }
};
