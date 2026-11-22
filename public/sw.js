// Service worker Mistrza Polskiego: cała aplikacja w pamięci urządzenia, działa bez internetu.
// Build wpisuje tu wersję i listę plików (vite.config.ts), więc każde wydanie zmienia ten plik
// i przeglądarka wykrywa nową wersję. Dane ucznia NIE są tu trzymane (są w localStorage).
const VERSION = '__CACHE_VERSION__';
const FILES = __PRECACHE_FILES__;
const CACHE = 'mp-' + VERSION;

self.addEventListener('install', (event) => {
  // Bez skipWaiting: nowa wersja czeka, aż uczeń sam kliknie „Odśwież” w powiadomieniu.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('mp-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate', ignoreVary: true });
    if (cached) return cached;
    try {
      return await fetch(req);
    } catch (err) {
      if (req.mode === 'navigate') {
        const shell = await cache.match('./', { ignoreVary: true });
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
