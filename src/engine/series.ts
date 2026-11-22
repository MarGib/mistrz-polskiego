import { SENTENCES } from '../data/sentences.ts';
import { ORTHO_SETS } from '../data/orthography.ts';
import type { Dot } from '../data/modules.ts';
import { parseGapWord, parseSentence, type GapWord, type Token } from './parse.ts';

export const SERIES_LENGTH = 8;
/** Ile poprawnych na 8, żeby zaliczyć kropkę. */
export const PASS_SCORE = 6;

export type MarkTask = { kind: 'mark'; tokens: Token[]; targets: Set<number> };
export type GapTask = { kind: 'gap'; word: GapWord; options: readonly string[] };
export type Task = MarkTask | GapTask;

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Losuje serię zadań dla kropki. */
export function buildSeries(dot: Dot, rnd: () => number = Math.random): Task[] {
  if (dot.kind === 'mark') {
    const pool = SENTENCES.map(parseSentence)
      .map((tokens) => ({
        tokens,
        targets: new Set(tokens.flatMap((t, i) => (t.part && dot.targets.includes(t.part) ? [i] : []))),
      }))
      .filter((t) => t.targets.size > 0);
    return shuffle(pool, rnd).slice(0, SERIES_LENGTH).map((t) => ({ kind: 'mark', ...t }));
  }
  const set = ORTHO_SETS[dot.set];
  return shuffle([...set.words], rnd)
    .slice(0, SERIES_LENGTH)
    .map((w) => ({ kind: 'gap', word: parseGapWord(w), options: set.options }));
}

export type MarkResult = { correct: boolean; hits: number[]; missed: number[]; wrong: number[] };

/** Porównuje zaznaczone wyrazy z oczekiwanymi. */
export function checkMark(task: MarkTask, selected: Set<number>): MarkResult {
  const hits = [...selected].filter((i) => task.targets.has(i));
  const wrong = [...selected].filter((i) => !task.targets.has(i));
  const missed = [...task.targets].filter((i) => !selected.has(i));
  return { correct: wrong.length === 0 && missed.length === 0, hits, missed, wrong };
}
