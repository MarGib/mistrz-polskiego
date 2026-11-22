// Sprawdza tryb offline (PWA). Wymaga: npm run build && npm run preview (port 4174).
// Uruchom: node tools/offline-check.mjs
import { chromium } from 'playwright';

const URL = process.argv[2] ?? 'http://localhost:4174/';
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(URL);
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForTimeout(1500);
const cached = await page.evaluate(async () => {
  const keys = await caches.keys();
  return keys.length ? (await (await caches.open(keys[0])).keys()).length : 0;
});
await ctx.setOffline(true);
await page.reload();
await page.getByText('Znajdź rzeczowniki').click();
const ok = await page.getByText('Zaznacz wszystkie').isVisible();
console.log(`pliki w pamięci: ${cached}, działa offline: ${ok}, błędy: ${errors.length ? errors.join('; ') : 'brak'}`);
await browser.close();
process.exit(ok && cached > 0 && errors.length === 0 ? 0 : 1);
