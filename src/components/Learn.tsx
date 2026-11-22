import { useState } from 'react';
import { LESSONS, type LessonId } from '../data/lessons.ts';
import LessonCard from './LessonCard.tsx';

type Props = { title: string; lessons: LessonId[]; doneLabel: string; onDone: () => void; onExit: () => void };

/** Lekcje „Poznaj” jedna po drugiej. */
export default function Learn({ title, lessons, doneLabel, onDone, onExit }: Props) {
  const [i, setI] = useState(0);
  const lesson = LESSONS[lessons[i]];
  const last = i === lessons.length - 1;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onExit} aria-label="Zamknij" className="rounded-lg px-2 py-1 text-2xl text-stone-400 active:scale-90">
          ✕
        </button>
        <h1 className="flex-1 truncate font-bold">{title}</h1>
        {lessons.length > 1 && (
          <span className="text-sm font-semibold text-stone-500">
            {i + 1}/{lessons.length}
          </span>
        )}
      </div>
      {lesson && <LessonCard key={lessons[i]} lesson={lesson} />}
      <div className="mt-auto flex gap-3 pt-4">
        {i > 0 && (
          <button onClick={() => setI(i - 1)} className="rounded-2xl bg-white px-5 py-4 text-lg font-bold ring-1 ring-stone-300 active:scale-[0.98]">
            ←
          </button>
        )}
        <button
          onClick={() => (last ? onDone() : setI(i + 1))}
          className="flex-1 rounded-2xl bg-rose-600 py-4 text-lg font-bold text-white active:scale-[0.98]"
        >
          {last ? doneLabel : 'Dalej'}
        </button>
      </div>
    </div>
  );
}
