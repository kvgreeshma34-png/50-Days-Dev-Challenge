/* ========================================== */
/* sw.js: The Service Worker Background Proxy */
/* ========================================== */

const CACHE_NAME = 'platform-cache-v1';

const ASSETS_TO_CACHE = [
    './index.html',
    './style.css',
    './main.js',
    './api.js',
    './utils.js'
];

// 1. THE INSTALL LIFECYCLE
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing phase...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Pre-caching core assets.');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// 2. THE FETCH INTERCEPTOR (Cache-First Strategy with Fallback)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).catch(() => {
                    console.warn('[Service Worker] Network request failed. Serving offline fallback.');
                    return caches.match('./index.html');
                });
            })
    );
});

// 3. THE ACTIVATE LIFECYCLE (Cleanup old caches)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activation phase...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});