// Service worker Mistrza Polskiego: cała aplikacja w pamięci urządzenia, działa bez internetu.
// Lista plików pochodzi z precache.json (tworzy go build). Dane ucznia NIE są tu trzymane (są w localStorage).
const PREFIX = 'mp-';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const res = await fetch('./precache.json', { cache: 'no-store' });
    const { version, files } = await res.json();
    const cache = await caches.open(PREFIX + version);
    await cache.addAll(files);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const res = await fetch('./precache.json', { cache: 'no-store' }).catch(() => null);
    const current = res ? PREFIX + (await res.json()).version : null;
    if (current) {
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && key !== current) await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: req.mode === 'navigate', ignoreVary: true });
    if (cached) return cached;
    try {
      return await fetch(req);
    } catch (err) {
      if (req.mode === 'navigate') {
        const shell = await caches.match('./', { ignoreVary: true });
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
