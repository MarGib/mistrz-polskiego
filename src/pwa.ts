/**
 * PWA: tryb offline, powiadomienie o nowej wersji i instalacja na ekranie początkowym.
 * Nowa wersja NIE włącza się sama: uczeń klika „Odśwież” w powiadomieniu (nie przerywamy ćwiczeń).
 */
type Listener = () => void;

let applyUpdate: (() => void) | null = null;
let installEvent: (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null = null;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const updateReady = () => applyUpdate !== null;
export const canPromptInstall = () => installEvent !== null;

export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

export function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Pokazuje systemowe okno instalacji (Android, Chrome, Edge). */
export async function promptInstall(): Promise<boolean> {
  if (!installEvent) return false;
  const e = installEvent;
  installEvent = null;
  emit();
  await e.prompt();
  return (await e.userChoice).outcome === 'accepted';
}

export function initPwa(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e as typeof installEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    emit();
  });

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  let userAsked = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (userAsked) window.location.reload();
  });

  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      const offer = (worker: ServiceWorker) => {
        applyUpdate = () => {
          userAsked = true;
          worker.postMessage('SKIP_WAITING');
        };
        emit();
      };
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
        });
      });
      // Sprawdzaj nowe wydanie po powrocie do aplikacji i co 30 minut.
      const check = () => void reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      setInterval(check, 30 * 60 * 1000);
    })
    .catch(() => {});
}

export function runUpdate(): void {
  applyUpdate?.();
}
