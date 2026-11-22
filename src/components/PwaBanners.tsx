import { useEffect, useReducer, useState } from 'react';
import { canPromptInstall, isIOS, isStandalone, promptInstall, runUpdate, subscribe, updateReady } from '../pwa.ts';

const DISMISS_KEY = 'mp_install_dismissed';

function useRerender() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const unsubscribe = subscribe(force);
    return () => {
      unsubscribe();
    };
  }, []);
}

/** Powiadomienie o nowej wersji. Uczeń sam decyduje, kiedy odświeżyć. */
export function UpdateBanner() {
  useRerender();
  if (!updateReady()) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 rounded-2xl bg-stone-900 p-3 pl-4 text-white shadow-xl">
        <span className="text-2xl">✨</span>
        <div className="flex-1 text-sm leading-tight">
          <b>Jest nowa wersja!</b>
          <br />
          Odśwież, żeby z niej korzystać. Twoje wyniki zostaną.
        </div>
        <button onClick={runUpdate} className="rounded-xl bg-rose-500 px-4 py-2.5 font-bold active:scale-95">
          Odśwież
        </button>
      </div>
    </div>
  );
}

/** Zachęta do instalacji na ekranie początkowym (Android/Chrome: przycisk, iPhone: instrukcja). */
export function InstallCard() {
  useRerender();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  if (dismissed || isStandalone()) return null;
  const ios = isIOS();
  if (!ios && !canPromptInstall()) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* bez zapamiętania */
    }
  };

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl bg-sky-50 p-4 text-sky-950 ring-1 ring-sky-200">
      <span className="text-2xl">📲</span>
      <div className="flex-1 text-sm">
        <b>Zainstaluj Mistrza Polskiego</b>
        <p className="mt-0.5">
          {ios ? (
            <>Stuknij <b>Udostępnij</b> (kwadrat ze strzałką), a potem <b>„Do ekranu początkowego”</b>. Działa też bez internetu.</>
          ) : (
            <>Będzie na ekranie jak zwykła aplikacja i zadziała też bez internetu.</>
          )}
        </p>
        {!ios && (
          <button onClick={() => void promptInstall()} className="mt-2 rounded-xl bg-sky-600 px-4 py-2 font-bold text-white active:scale-95">
            Zainstaluj
          </button>
        )}
      </div>
      <button onClick={dismiss} aria-label="Nie teraz" className="text-xl text-sky-400">
        ✕
      </button>
    </div>
  );
}
