// service-worker.js

const CACHE_NAME = 'sippak-cib-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/js/app.js'
];

// Menginstal Service Worker dan menyimpan file penting ke memori HP
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Mengambil file dari memori HP jika internet tidak stabil
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
