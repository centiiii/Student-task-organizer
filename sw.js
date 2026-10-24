// Change CACHE_VERSION whenever you add or rename files in the precache list.
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'task-organizer-' + CACHE_VERSION;

const PRECACHE_URLS = [
  './',
  'index.html',
  'about.html',
  'privacy.html',
  'css/style.css',
  'js/script.js',
  'js/theme.js',
  'js/pwa.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('task-organizer-') && name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Only handle GET requests to same origin
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request, { ignoreSearch: true })
          .then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // For navigations, fallback to index.html
            if (request.mode === 'navigate') {
              return caches.match('index.html', { ignoreSearch: true });
            }
            return new Response('', { status: 504, statusText: 'Offline' });
          });
      })
  );
});