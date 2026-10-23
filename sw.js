/*
 * Edugates International School — Math-Science Team
 * Offline Smartboard Service Worker (v3.0 — Network-First HTML/JS/CSS + Cache-First WASM/Assets)
 */
const CACHE_NAME = 'edugates-math-science-smartboard-v4';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/edugates-smartboard.css',
  './js/edugates-smartboard.js',
  './assets/eis-logo.jpg',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = event.request.url || '';
  var isHeavyBinary = url.indexOf('.wasm') !== -1 || url.indexOf('/assets/') !== -1;

  if (isHeavyBinary) {
    // Cache-First for immutable WASM binaries & images
    event.respondWith(
      caches.match(event.request).then(function (cachedResponse) {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(function (networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            var clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // Network-First with Offline Cache Fallback for HTML, CSS, and JS
    event.respondWith(
      fetch(event.request).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
