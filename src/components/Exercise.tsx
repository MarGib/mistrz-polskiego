import { useMemo, useState } from 'react';
import type { Dot } from '../data/modules.ts';
import { PARTS } from '../data/partsOfSpeech.ts';
import { ORTHO_SETS } from '../data/orthography.ts';
import { buildSeries, checkMark, PASS_SCORE, SERIES_LENGTH, type GapTask, type MarkResult, type MarkTask } from '../engine/series.ts';
import { recordSeries, type Progress } from '../engine/storage.ts';

type Props = { dot: Dot; progress: Progress; onFinish: (p: Progress) => void; onExit: () => void };
type Answer = { key: string; ok: boolean };

export default function Exercise({ dot, progress, onFinish, onExit }: Props) {
  const tasks = useMemo(() => buildSeries(dot), [dot]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState(false);

  const statKey = dot.kind === 'mark' ? dot.targets.join('+') : dot.set;
  const score = answers.filter((a) => a.ok).length;

  function answered(ok: boolean) {
    setAnswers((a) => [...a, { key: statKey, ok }]);
  }
  function next() {
    if (i + 1 < tasks.length) {
      setI(i + 1);
    } else {
      onFinish(recordSeries(progress, dot.id, score, PASS_SCORE, answers));
      setDone(true);
    }
  }

  if (done) {
    const passed = score >= PASS_SCORE;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">{score === SERIES_LENGTH ? '🏆' : passed ? '🎉' : '💪'}</div>
        <h2 className="text-2xl font-bold">
          {score}/{SERIES_LENGTH}
        </h2>
        <p className="text-stone-600">
          {passed ? 'Brawo! Kropka zaliczona.' : `Do zaliczenia potrzeba ${PASS_SCORE}. Spróbuj jeszcze raz!`}
        </p>
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
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onExit} aria-label="Zamknij" className="rounded-lg px-2 py-1 text-2xl text-stone-400 active:scale-90">
          ✕
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${(answers.length / tasks.length) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold text-stone-500">
          {i + 1}/{tasks.length}
        </span>
      </div>

      {task.kind === 'mark' && dot.kind === 'mark' && (
        <MarkView key={i} task={task} targetsLabel={dot.targets.map((t) => PARTS[t].plural).join(' i ')} question={dot.targets.map((t) => PARTS[t].question).join(' / ')} onAnswer={answered} locked={answeredThis} />
      )}
      {task.kind === 'gap' && dot.kind === 'gap' && (
        <GapView key={i} task={task} rule={ORTHO_SETS[dot.set].rule} onAnswer={answered} locked={answeredThis} />
      )}

      {answeredThis && (
        <button onClick={next} className="mt-auto w-full rounded-2xl bg-stone-900 py-4 text-lg font-bold text-white active:scale-[0.98]">
          {i + 1 < tasks.length ? 'Dalej' : 'Zobacz wynik'}
        </button>
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
