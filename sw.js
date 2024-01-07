/** @type {string} */
const VERSION = 'v1';
/** @type {string} */
const CACHE_NAME = `alluvialed-${VERSION}`;

/** @type {RequestInfo[]} */
const INITIAL_RESOURCES = [
  '/',
  '/index.html',
  '/assets/js/player.js',
  '/assets/css/site.css',
  '/assets/img/darkwood.jpg',
];

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(INITIAL_RESOURCES);
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
    // Cache http and https only, skip unsupported chrome-extension:// and file://...
    if (!(
       e.request.url.startsWith('http:') || e.request.url.startsWith('https:')
    )) {
      console.log('[Service Worker] Failed fetching resource: Not a http request');
      return; 
    }

  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(CACHE_NAME);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});
