const CACHE_NAME = 'proquelec-app-v2';
const DATA_CACHE_NAME = 'proquelec-data-v2';

const APP_SHELL = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/logo.png',
    '/logo-proquelec.svg',
    '/pwa-icon.png',
    '/vite.svg'
];

// Normes critiques à mettre en cache pour le mode hors-ligne
const CRITICAL_DATA = [
    '/data/NS-01-001/full_ai/ns_01_001_full.json',
    '/data/NS-01-001/full_ai/datasets/qcm_multi.json',
    '/data/NS-01-001/full_ai/train/chunks.jsonl'
];

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(APP_SHELL);
        })
    );
    // Force activation immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // NE PAS intercepter :
    // 1. Les API (toujours réseau direct)
    // 2. Les fichiers internes de Vite / Dev
    // 3. Les extensions Chrome
    if (
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/@') ||
        url.pathname.startsWith('/src/') ||
        url.pathname.includes('node_modules') ||
        url.hostname === 'chrome-extension' ||
        url.hostname.includes('localhost') && url.port === '5173' && !url.pathname.startsWith('/data/') // Skip Vite dev server assets
    ) {
        return;
    }

    // Stratégie pour les fichiers de données (/data/) : Stale-While-Revalidate
    if (url.pathname.includes('/data/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    const fetchPromise = fetch(event.request)
                        .then((networkResponse) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        })
                        .catch(err => {
                            console.warn('[ServiceWorker] Fetch failed for data:', url.pathname);
                            return response; // Retourne le cache si le fetch échoue
                        });

                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    // Stratégie pour l'App Shell : Cache First, fallback to Network
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(err => {
                console.error('[ServiceWorker] Offline/Fetch error for:', url.pathname);
                // Si c'est une navigation, on pourrait retourner l'index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('Network error occurred', {
                    status: 408,
                    statusText: 'Network error occurred'
                });
            });
        })
    );
});

// Écouter les messages pour le cache préventif (Preload)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRECACHE_CRITICAL_DATA') {
        caches.open(DATA_CACHE_NAME).then(cache => {
            console.log('[ServiceWorker] Precaching critical normative data...');
            cache.addAll(CRITICAL_DATA);
        });
    }
});
