import { MODULES, type Dot } from '../data/modules.ts';
import { isUnlocked } from '../engine/path.ts';
import { SERIES_LENGTH } from '../engine/series.ts';
import type { Progress } from '../engine/storage.ts';
import { InstallCard } from './PwaBanners.tsx';

type Props = { progress: Progress; onPlay: (dot: Dot) => void; onStats: () => void; onKnowledge: () => void };

export default function Home({ progress, onPlay, onStats, onKnowledge }: Props) {
  return (
    <>
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="./icon.svg" alt="" className="h-11 w-11 rounded-xl" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Mistrz Polskiego</h1>
            <p className="text-sm text-stone-500">gramatyka i ortografia</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onKnowledge} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-stone-200 active:scale-95">
            📖 Wiedza
          </button>
          <button onClick={onStats} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-stone-200 active:scale-95">
            📊 Wyniki
          </button>
        </div>
      </header>

      <InstallCard />

      <main className="flex flex-col gap-4">
        {MODULES.map((m, mi) => (
          <section key={m.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
            <h2 className="mb-3 font-bold">
              <span className="mr-2">{m.emoji}</span>
              {m.id.startsWith('m') ? `${mi + 1}. ` : ''}
              {m.title}
            </h2>
            <ol className="flex flex-col gap-2">
              {m.dots.map((d) => {
                const dp = progress.dots[d.id];
                const open = isUnlocked(d.id, progress);
                return (
                  <li key={d.id}>
                    <button
                      disabled={!open}
                      onClick={() => onPlay(d)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition active:scale-[0.98] ${
                        dp?.passed ? 'bg-emerald-50 ring-1 ring-emerald-200' : open ? 'bg-rose-50 ring-1 ring-rose-200' : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          dp?.passed ? 'bg-emerald-500 text-white' : open ? 'bg-rose-600 text-white' : 'bg-stone-300 text-white'
                        }`}
                      >
                        {dp?.passed ? '✓' : !open ? '🔒' : d.kind === 'learn' ? '📖' : '▶'}
                      </span>
                      <span className="flex-1 font-semibold">{d.title}</span>
                      {dp && d.kind !== 'learn' && (
                        <span className="text-sm text-stone-500">
                          najlepiej {dp.best}/{SERIES_LENGTH}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </main>

      <footer className="mt-6 mb-20 text-center text-xs text-stone-400">
        Twoje wyniki są zapisane tylko na tym urządzeniu. · wersja {__APP_VERSION__}
      </footer>
    </>
  );
}
