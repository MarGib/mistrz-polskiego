import { useMemo, useState } from 'react';
import type { Dot } from '../data/modules.ts';
import { PARTS, type PartCode } from '../data/partsOfSpeech.ts';
import { ORTHO_SETS } from '../data/orthography.ts';
import type { LessonId } from '../data/lessons.ts';
import {
  buildSeries,
  checkMark,
  lessonsForTask,
  PASS_SCORE,
  statKeyOf,
  type ChooseTask,
  type GapTask,
  type MarkResult,
  type MarkTask,
  type Task,
} from '../engine/series.ts';
import { recordSeries, type AnswerRecord, type Progress } from '../engine/storage.ts';
import { pointsFor } from '../engine/points.ts';
import { newBadges, type Badge } from '../engine/badges.ts';
import Learn from './Learn.tsx';

type Props = {
  dot: Dot;
  progress: Progress;
  /** Gotowe zadania (trening słabych stron). Bez nich seria jest losowana dla kropki. */
  tasks?: Task[];
  onFinish: (p: Progress) => void;
  onExit: () => void;
};

export default function Exercise({ dot, progress, tasks: given, onFinish, onExit }: Props) {
  const tasks = useMemo(() => given ?? buildSeries(dot), [dot, given]);
  const training = dot.kind === 'training';
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [done, setDone] = useState<null | { gained: number; badges: Badge[]; before: Progress }>(null);
  const [showHelp, setShowHelp] = useState(false);

  const score = answers.filter((a) => a.ok).length;
  const live = answers.length ? pointsFor(answers, false) : 0;

  function answered(ok: boolean, picked?: string) {
    const task = tasks[i];
    setAnswers((a) => [...a, { item: task.item, key: statKeyOf(task), ok, picked, training }]);
  }
  function next() {
    if (i + 1 < tasks.length) {
      setI(i + 1);
    } else {
      const after = recordSeries(progress, dot.id, score, training ? 0 : PASS_SCORE, answers);
      onFinish(after);
      setDone({ gained: after.points - progress.points, badges: newBadges(progress, after), before: progress });
    }
  }

  if (showHelp) {
    return (
      <Learn
        title="Przypomnienie"
        lessons={lessonsForTask(tasks[i]) as LessonId[]}
        doneLabel="Wracam do zadań"
        onDone={() => setShowHelp(false)}
        onExit={() => setShowHelp(false)}
      />
    );
  }

  if (done) {
    const passed = training || score >= PASS_SCORE;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">{score === tasks.length ? '🏆' : score >= Math.ceil(tasks.length * 0.75) ? '🎉' : '💪'}</div>
        <h2 className="text-3xl font-bold">
          {score}/{tasks.length}
        </h2>
        <div className="rounded-full bg-amber-100 px-4 py-1.5 text-lg font-bold text-amber-800">⭐ +{done.gained} pkt</div>
        <p className="text-stone-600">
          {training
            ? score === tasks.length
              ? 'Wszystkie słabe strony poprawione!'
              : score === 0
                ? 'Nie szkodzi! Zajrzyj do 📖 wiedzy. Te zadania wrócą w kolejnym treningu.'
                : 'Dobra robota! To, co jeszcze nie wyszło, wróci w kolejnym treningu.'
            : passed
              ? 'Brawo! Kropka zaliczona.'
              : `Do zaliczenia potrzeba ${PASS_SCORE}. Zajrzyj do wiedzy i spróbuj jeszcze raz!`}
        </p>
        {done.badges.map((b) => (
          <div key={b.id} className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-100 to-rose-100 p-4 text-left ring-1 ring-amber-300">
            <span className="text-4xl">{b.emoji}</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-amber-700">Nowa odznaka!</div>
              <div className="text-lg font-bold">{b.name}</div>
            </div>
          </div>
        ))}
        <button onClick={onExit} className="mt-2 w-full rounded-2xl bg-rose-600 py-4 text-lg font-bold text-white active:scale-[0.98]">
          Wróć do ścieżki
        </button>
      </div>
    );
  }

  const task = tasks[i];
  const answeredThis = answers.length > i;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-2.5">
        <button onClick={onExit} aria-label="Zamknij" className="rounded-lg px-1.5 py-1 text-2xl text-stone-400 active:scale-90">
          ✕
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${(answers.length / tasks.length) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold text-stone-500">
          {i + 1}/{tasks.length}
        </span>
        <span className="min-w-[3.5rem] rounded-full bg-amber-100 px-2 py-1 text-center text-sm font-bold text-amber-800" aria-label="Punkty w tej serii">
          ⭐ {live}
        </span>
        <button onClick={() => setShowHelp(true)} aria-label="Przypomnij wiedzę" className="rounded-full bg-sky-100 px-2.5 py-1 text-sm font-bold text-sky-800 active:scale-90">
          📖
        </button>
      </div>
      {training && <p className="-mt-2 mb-3 text-sm font-semibold text-rose-700">🎯 Trening słabych stron</p>}

      {task.kind === 'mark' && (
        <MarkView
          key={i}
          task={task}
          targetsLabel={task.parts.map((t) => PARTS[t].plural).join(' i ')}
          question={task.parts.map((t) => PARTS[t].question).join(' / ')}
          onAnswer={(ok) => answered(ok)}
          locked={answeredThis}
        />
      )}
      {task.kind === 'choose' && <ChooseView key={i} task={task} onAnswer={(ok, picked) => answered(ok, picked)} locked={answeredThis} />}
      {task.kind === 'gap' && <GapView key={i} task={task} rule={ORTHO_SETS[task.set].rule} onAnswer={(ok) => answered(ok)} locked={answeredThis} />}

      {answeredThis && (
        <button onClick={next} className="mt-auto w-full rounded-2xl bg-stone-900 py-4 text-lg font-bold text-white active:scale-[0.98]">
          {i + 1 < tasks.length ? 'Dalej' : 'Zobacz wynik'}
        </button>
      )}
    </div>
  );
}

function ChooseView({ task, onAnswer, locked }: { task: ChooseTask; onAnswer: (ok: boolean, picked: string) => void; locked: boolean }) {
  const [picked, setPicked] = useState<PartCode | null>(null);
  const ok = picked === task.answer;
  const word = task.tokens[task.index].text;

  function pick(o: PartCode) {
    if (locked || picked) return;
    setPicked(o);
    onAnswer(o === task.answer, o);
  }

  return (
    <div className="mb-4 flex flex-col gap-5">
      <h2 className="text-lg font-bold">
        Jaką częścią mowy jest wyraz <span className="text-rose-600">„{word}”</span>?
      </h2>
      <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-2 text-2xl leading-relaxed">
        {task.tokens.map((t, idx) =>
          t.punct ? (
            <span key={idx} className="-ml-1.5">{t.text}</span>
          ) : (
            <span key={idx} className={idx === task.index ? 'rounded-lg bg-rose-600 px-1.5 py-0.5 font-bold text-white' : 'px-0.5'}>
              {t.text}
            </span>
          ),
        )}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {task.options.map((o) => {
          const state = !picked ? 'idle' : o === task.answer ? 'right' : o === picked ? 'wrong' : 'idle';
          return (
            <button
              key={o}
              onClick={() => pick(o)}
              className={`rounded-2xl px-3 py-3.5 text-lg font-bold shadow-sm ring-1 transition active:scale-95 ${
                state === 'right' ? 'bg-emerald-500 text-white ring-emerald-500' : state === 'wrong' ? 'bg-red-500 text-white ring-red-500' : 'bg-white ring-stone-300'
              }`}
            >
              {PARTS[o].name}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className={`rounded-xl p-3 ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
          {ok ? (
            <>✅ Tak! „{word}” to {PARTS[task.answer].name}: odpowiada na pytanie <b>{PARTS[task.answer].question}</b></>
          ) : (
            <><b>„{word}” to {PARTS[task.answer].name}.</b> Pytanie pomocnicze: <b>{PARTS[task.answer].question}</b></>
          )}
        </div>
      )}
    </div>
  );
}

function MarkView({ task, targetsLabel, question, onAnswer, locked }: { task: MarkTask; targetsLabel: string; question: string; onAnswer: (ok: boolean) => void; locked: boolean }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<MarkResult | null>(null);

  function toggle(idx: number) {
    if (locked) return;
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  }
  function check() {
    const r = checkMark(task, selected);
    setResult(r);
    onAnswer(r.correct);
  }

  function wordClass(idx: number) {
    if (result) {
      if (result.hits.includes(idx)) return 'bg-emerald-500 text-white';
      if (result.wrong.includes(idx)) return 'bg-red-500 text-white line-through';
      if (result.missed.includes(idx)) return 'bg-white text-emerald-700 ring-2 ring-emerald-500';
      return 'bg-white text-stone-700';
    }
    return selected.has(idx) ? 'bg-rose-600 text-white' : 'bg-white text-stone-800 ring-1 ring-stone-300';
  }

  return (
    <div className="mb-4 flex flex-col gap-5">
      <h2 className="text-lg font-bold">
        Zaznacz wszystkie <span className="text-rose-600">{targetsLabel}</span>
      </h2>
      <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-2.5 text-2xl leading-relaxed">
        {task.tokens.map((t, idx) =>
          t.punct ? (
            <span key={idx} className="-ml-1.5">{t.text}</span>
          ) : (
            <button key={idx} onClick={() => toggle(idx)} className={`rounded-lg px-1.5 py-0.5 transition active:scale-95 ${wordClass(idx)}`}>
              {t.text}
            </button>
          ),
        )}
      </p>
      {!result && (
        <button onClick={check} className="w-full rounded-2xl bg-rose-600 py-4 text-lg font-bold text-white active:scale-[0.98]">
          Sprawdź
        </button>
      )}
      {result && (
        <div className={`rounded-xl p-3 ${result.correct ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
          {result.correct ? (
            '✅ Świetnie, wszystko dobrze!'
          ) : (
            <>
              <b>Prawie!</b> Podpowiedź: szukamy wyrazów, które odpowiadają na pytanie <b>{question}</b>
              {result.missed.length > 0 && ' Pominięte wyrazy mają zieloną ramkę.'}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function GapView({ task, rule, onAnswer, locked }: { task: GapTask; rule: string; onAnswer: (ok: boolean) => void; locked: boolean }) {
  const [picked, setPicked] = useState<string | null>(null);
  const ok = picked === task.word.answer;

  function pick(o: string) {
    if (locked || picked) return;
    setPicked(o);
    onAnswer(o === task.word.answer);
  }

  return (
    <div className="mb-4 flex flex-col gap-6">
      <h2 className="text-lg font-bold">Wpisz brakującą literę</h2>
      <p className="text-center text-5xl font-bold tracking-wide">
        {task.word.before}
        <span className={`mx-0.5 inline-block min-w-[1.2em] rounded-lg border-b-4 px-1 ${picked ? (ok ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600') : 'border-rose-400 text-rose-300'}`}>
          {picked ? task.word.answer : '_'}
        </span>
        {task.word.after}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {task.options.map((o) => (
          <button
            key={o}
            onClick={() => pick(o)}
            className={`rounded-2xl py-5 text-3xl font-bold shadow-sm ring-1 transition active:scale-95 ${
              picked === o ? (ok ? 'bg-emerald-500 text-white ring-emerald-500' : 'bg-red-500 text-white ring-red-500') : 'bg-white ring-stone-300'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {picked && (
        <div className={`rounded-xl p-3 ${ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
          {ok ? '✅ Dobrze!' : <><b>Poprawnie: {task.word.before}{task.word.answer}{task.word.after}.</b> {rule}</>}
        </div>
      )}
    </div>
  );
}
