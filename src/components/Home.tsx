import { MODULES, type Dot } from '../data/modules.ts';
import { isUnlocked } from '../engine/path.ts';
import { SERIES_LENGTH } from '../engine/series.ts';
import { streakDays, type Progress } from '../engine/storage.ts';
import { titleFor } from '../engine/points.ts';
import { weakItems } from '../engine/training.ts';
import { InstallCard } from './PwaBanners.tsx';

type Props = { progress: Progress; onPlay: (dot: Dot) => void; onStats: () => void; onKnowledge: () => void; onTraining: () => void };

export default function Home({ progress, onPlay, onStats, onKnowledge, onTraining }: Props) {
  const title = titleFor(progress.points);
  const streak = streakDays(progress);
  const weak = weakItems(progress).length;

  return (
    <>
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src="./icon.svg" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight">Mistrz Polskiego</h1>
            <p className="truncate text-xs text-stone-500">gramatyka i ortografia</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button onClick={onKnowledge} className="flex flex-col items-center rounded-xl bg-white px-2.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-stone-200 active:scale-95">
            <span className="text-lg leading-none">📖</span>Wiedza
          </button>
          <button onClick={onStats} className="flex flex-col items-center rounded-xl bg-white px-2.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-stone-200 active:scale-95">
            <span className="text-lg leading-none">📊</span>Postępy
          </button>
        </div>
      </header>

      <button onClick={onStats} className="mb-4 w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-stone-200 active:scale-[0.99]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{title.emoji}</span>
          <div className="flex-1">
            <div className="font-bold">{title.name}</div>
            <div className="text-sm text-stone-500">
              {title.next ? `${title.toNext} pkt do tytułu „${title.next.name}”` : 'Najwyższy tytuł zdobyty!'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-amber-600">⭐ {progress.points}</div>
            <div className="text-sm font-semibold text-orange-600">{streak > 0 ? `🔥 ${streak} ${streak === 1 ? 'dzień' : 'dni'}` : '🔥 0'}</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500" style={{ width: `${Math.round(title.progress * 100)}%` }} />
        </div>
      </button>

      {weak > 0 && (
        <button onClick={onTraining} className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-rose-600 p-4 text-left text-white shadow-md active:scale-[0.99]">
          <span className="text-3xl">🎯</span>
          <div className="flex-1">
            <div className="font-bold">Trening słabych stron</div>
            <div className="text-sm text-rose-100">
              {weak} {weak === 1 ? 'rzecz' : weak < 5 ? 'rzeczy' : 'rzeczy'} do poprawienia. Ćwicz to, co jeszcze nie wychodzi.
            </div>
          </div>
          <span className="text-2xl">›</span>
        </button>
      )}

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
