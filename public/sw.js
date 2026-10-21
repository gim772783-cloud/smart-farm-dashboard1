// Simple progressive web app service worker
const CACHE_NAME = 'green-wall-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through with network first, then cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
