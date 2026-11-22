import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/** Wersja aplikacji (jedna na build), widoczna w stopce. */
const APP_VERSION = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Warsaw' }).slice(0, 16);
const CACHE_VERSION = Date.now().toString(36);

/**
 * Po zbudowaniu zapisuje listę wszystkich plików aplikacji (precache.json).
 * Service worker pobiera je przy instalacji, więc aplikacja działa w całości bez internetu.
 */
function precacheManifest(): Plugin {
  return {
    name: 'mp-precache-manifest',
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
      const files2 = files.filter((f) => !/(^sw\.js$|^precache\.json$|\.map$)/.test(f)).sort();
      fs.writeFileSync(
        path.join(dist, 'precache.json'),
        JSON.stringify({ version: CACHE_VERSION, appVersion: APP_VERSION, files: ['./', ...files2] }),
      );
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), precacheManifest()],
  define: { __APP_VERSION__: JSON.stringify(APP_VERSION) },
});
