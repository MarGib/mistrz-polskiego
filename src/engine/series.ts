import { SENTENCES } from '../data/sentences.ts';
import { ORTHO_SETS } from '../data/orthography.ts';
import type { Dot } from '../data/modules.ts';
import type { PartCode } from '../data/partsOfSpeech.ts';
import { parseGapWord, parseSentence, type GapWord, type Token } from './parse.ts';

export const SERIES_LENGTH = 8;
/** Ile poprawnych na 8, żeby zaliczyć kropkę. */
export const PASS_SCORE = 6;

export type MarkTask = { kind: 'mark'; tokens: Token[]; targets: Set<number> };
export type ChooseTask = { kind: 'choose'; tokens: Token[]; index: number; answer: PartCode; options: PartCode[] };
export type GapTask = { kind: 'gap'; word: GapWord; options: readonly string[] };
export type Task = MarkTask | ChooseTask | GapTask;

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * „Wybór”: wyróżniony wyraz w zdaniu, uczeń wskazuje część mowy.
 * Części mowy z `ask` pojawiają się na zmianę (przeplatanie), każde zdanie najwyżej raz w serii.
 */
function buildChoose(ask: PartCode[], options: PartCode[], rnd: () => number): ChooseTask[] {
  const sentences = shuffle(SENTENCES.map(parseSentence), rnd);
  const queues = new Map<PartCode, { tokens: Token[]; index: number }[]>();
  for (const part of ask) queues.set(part, []);
  for (const tokens of sentences) {
    tokens.forEach((t, index) => {
      if (t.part && queues.has(t.part)) queues.get(t.part)!.push({ tokens, index });
    });
  }
  for (const [k, q] of queues) queues.set(k, shuffle(q, rnd));
  const used = new Set<Token[]>();
  const out: ChooseTask[] = [];
  const order = shuffle(ask, rnd);
  for (let round = 0; out.length < SERIES_LENGTH && round < 50; round++) {
    for (const part of order) {
      if (out.length >= SERIES_LENGTH) break;
      const q = queues.get(part)!;
      const pickIdx = q.findIndex((c) => !used.has(c.tokens));
      if (pickIdx === -1) continue;
      const [c] = q.splice(pickIdx, 1);
      used.add(c.tokens);
      out.push({ kind: 'choose', tokens: c.tokens, index: c.index, answer: part, options });
    }
  }
  return shuffle(out, rnd);
}

/** Losuje serię zadań dla kropki. Kropka „learn” nie ma zadań. */
export function buildSeries(dot: Dot, rnd: () => number = Math.random): Task[] {
  if (dot.kind === 'learn') return [];
  if (dot.kind === 'choose') return buildChoose(dot.ask, dot.options, rnd);
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
