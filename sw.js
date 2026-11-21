'use strict';
// Caches the app shell so VolleyRo opens without signal after the first visit.
// Bump CACHE_VERSION when the shell files change; activate removes older caches.
const CACHE_PREFIX = 'volleyro-';
const CACHE_VERSION = 'v1';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

// Relative URLs resolve against this file, so it works under /VolleyRo/.
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'favicon.svg',
  'favicon-32.png',
  'apple-touch-icon.png',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Answer from the cache so the app opens instantly and offline, and refresh the
// cached copy from the network in the background when there is signal.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => cache.match(request, { ignoreSearch: true }).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      });
      if (cached) {
        network.catch(() => {});
        return cached;
      }
      return network.catch(() => (request.mode === 'navigate' ? cache.match('index.html') : Response.error()));
    }))
  );
});
