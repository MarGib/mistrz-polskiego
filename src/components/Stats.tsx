import { PARTS, isPartCode } from '../data/partsOfSpeech.ts';
import { ORTHO_SETS, type OrthoSetId } from '../data/orthography.ts';
import { ALL_DOTS } from '../data/modules.ts';
import { emptyProgress, type Progress } from '../engine/storage.ts';

type Props = { progress: Progress; onReset: (p: Progress) => void; onBack: () => void };

function label(key: string): string {
  if (isPartCode(key)) return PARTS[key].plural;
  if (key in ORTHO_SETS) return ORTHO_SETS[key as OrthoSetId].title;
  return key;
}

export default function Stats({ progress, onReset, onBack }: Props) {
  const entries = Object.entries(progress.stats);
  const passed = ALL_DOTS.filter((d) => progress.dots[d.id]?.passed).length;

  return (
    <>
      <header className="mb-5 flex items-center gap-3">
        <button onClick={onBack} aria-label="Wróć" className="rounded-lg px-2 py-1 text-2xl text-stone-500 active:scale-90">
          ←
        </button>
        <h1 className="text-xl font-bold">Twoje wyniki</h1>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <div className="text-3xl font-bold">{passed}/{ALL_DOTS.length}</div>
          <div className="text-sm text-stone-500">zaliczone kropki</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <div className="text-3xl font-bold">{progress.history.length}</div>
          <div className="text-sm text-stone-500">rozegrane serie</div>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-3 font-bold">Trafność</h2>
        {entries.length === 0 && <p className="text-stone-500">Jeszcze nic tu nie ma. Zagraj pierwszą kropkę!</p>}
        <ul className="flex flex-col gap-3">
          {entries.map(([key, s]) => {
            const pct = Math.round((s.ok / s.total) * 100);
            return (
              <li key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{label(key)}</span>
                  <span className="text-stone-500">{pct}% ({s.ok}/{s.total})</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
                  <div className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 text-center text-sm text-stone-500">
        Wszystko jest zapisane tylko na tym urządzeniu. Nikt inny tego nie widzi.
      </p>
      <button
        onClick={() => {
          if (confirm('Na pewno usunąć wszystkie wyniki z tego urządzenia?')) onReset(emptyProgress());
        }}
        className="mx-auto mt-3 rounded-lg px-3 py-2 text-sm text-red-600 underline"
      >
        Wyczyść wyniki
      </button>
    </>
  );
}
