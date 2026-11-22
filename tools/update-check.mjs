// Sprawdza cykl wydania PWA: stara wersja → nowe wydanie → powiadomienie → „Odśwież” → nowa wersja.
// Uruchom: node tools/update-check.mjs (sam buduje i uruchamia podgląd na porcie 4175).
import { chromium } from 'playwright';
import { execSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PORT = 4175;
const URL = `http://localhost:${PORT}/`;
const build = () => execSync('npx vite build', { stdio: 'ignore' });
const version = () => JSON.parse(readFileSync('dist/version.json', 'utf8')).version;
const serve = async () => {
  const p = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1500));
  return p;
};

build();
const v1 = version();
let server = await serve();
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(URL);
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForTimeout(800);
const bannerBefore = await page.getByText('Jest nowa wersja').count();

await new Promise((r) => setTimeout(r, 1100)); // inna wersja w nazwie
server.kill();
build();
const v2 = version();
server = await serve();
await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
await page.getByText('Jest nowa wersja').waitFor({ timeout: 10000 });
const reloaded = page.waitForEvent('load');
await page.getByRole('button', { name: 'Odśwież' }).click();
await reloaded;
await page.waitForTimeout(800);
const bannerAfter = await page.getByText('Jest nowa wersja').count();
const caches = await page.evaluate(() => caches.keys());
console.log({ v1, v2, bannerBefore, bannerAfter, caches, errors });
const ok = v1 !== v2 && bannerBefore === 0 && bannerAfter === 0 && caches.length === 1 && caches[0] === 'mp-' + v2 && errors.length === 0;
console.log(ok ? 'OK: powiadomienie i odświeżenie działają' : 'BŁĄD');
await browser.close();
server.kill();
process.exit(ok ? 0 : 1);
