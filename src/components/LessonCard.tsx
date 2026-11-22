import type { Lesson } from '../data/lessons.ts';

/** Zamienia `*wyraz*` na wyróżnienie. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('*').map((part, i) =>
        i % 2 ? (
          <b key={i} className="rounded bg-rose-100 px-0.5 text-rose-700">
            {part}
          </b>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <h2 className="mb-2 text-2xl font-bold">
        <span className="mr-2">{lesson.emoji}</span>
        {lesson.title}
      </h2>
      <p className="mb-4 text-lg leading-snug">
        <Rich text={lesson.what} />
      </p>

      {lesson.questions && (
        <div className="mb-4 rounded-xl bg-sky-50 p-3 text-sky-900">
          <div className="text-xs font-bold uppercase tracking-wide text-sky-700">Pytania pomocnicze</div>
          <div className="text-lg font-semibold">{lesson.questions}</div>
        </div>
      )}

      <div className="mb-4">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500">Przykłady</div>
        <ul className="flex flex-col gap-1.5 text-lg">
          {lesson.examples.map((e) => (
            <li key={e}>
              <Rich text={e} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500">Warto wiedzieć</div>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          {lesson.facts.map((f) => (
            <li key={f}>
              <Rich text={f} />
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-amber-50 p-3 text-amber-950">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-700">⚠️ Uwaga, pułapka</div>
        <Rich text={lesson.trap} />
      </div>
    </article>
  );
}
