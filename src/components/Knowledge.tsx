import { LESSONS, type LessonId } from '../data/lessons.ts';

type Props = { onOpen: (id: LessonId) => void; onBack: () => void };

/** Biblioteka wiedzy: wszystkie lekcje w jednym miejscu. */
export default function Knowledge({ onOpen, onBack }: Props) {
  const entries = Object.entries(LESSONS) as [LessonId, NonNullable<(typeof LESSONS)[LessonId]>][];
  return (
    <>
      <header className="mb-5 flex items-center gap-3">
        <button onClick={onBack} aria-label="Wróć" className="rounded-lg px-2 py-1 text-2xl text-stone-500 active:scale-90">
          ←
        </button>
        <h1 className="text-xl font-bold">📖 Wiedza</h1>
      </header>
      <ul className="grid grid-cols-2 gap-3">
        {entries.map(([id, l]) => (
          <li key={id}>
            <button onClick={() => onOpen(id)} className="flex w-full flex-col items-start gap-1 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-stone-200 active:scale-[0.98]">
              <span className="text-2xl">{l.emoji}</span>
              <span className="font-bold">{l.title}</span>
              {l.questions && <span className="line-clamp-1 text-sm text-stone-500">{l.questions}</span>}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
