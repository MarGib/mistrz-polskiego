import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/** Wersja aplikacji (jedna na build), widoczna w stopce. */
const APP_VERSION = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Warsaw' }).slice(0, 16);
const CACHE_VERSION = Date.now().toString(36);

/**
 * Po zbudowaniu wpisuje do dist/sw.js wersję i listę wszystkich plików aplikacji.
 * Service worker pobiera je przy instalacji, więc aplikacja działa w całości bez internetu,
 * a zmieniony sw.js pozwala przeglądarce wykryć nowe wydanie.
 */
function precacheServiceWorker(): Plugin {
  return {
    name: 'mp-precache-sw',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(import.meta.dirname, 'dist');
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const name of fs.readdirSync(dir)) {
          const full = path.join(dir, name);
          if (fs.statSync(full).isDirectory()) walk(full);
          else files.push(path.relative(dist, full).split(path.sep).join('/'));
        }
      };
      walk(dist);
      const list = ['./', ...files.filter((f) => !/(^sw\.js$|\.map$)/.test(f)).sort()];
      const swPath = path.join(dist, 'sw.js');
      const sw = fs
        .readFileSync(swPath, 'utf8')
        .replace('__CACHE_VERSION__', CACHE_VERSION)
        .replace('__PRECACHE_FILES__', JSON.stringify(list));
      fs.writeFileSync(swPath, sw);
      fs.writeFileSync(path.join(dist, 'version.json'), JSON.stringify({ version: CACHE_VERSION, appVersion: APP_VERSION }));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), precacheServiceWorker()],
  define: { __APP_VERSION__: JSON.stringify(APP_VERSION) },
});
