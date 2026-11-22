import { SENTENCES } from '../data/sentences.ts';
import { ORTHO_SETS, type OrthoSetId } from '../data/orthography.ts';
import type { Dot } from '../data/modules.ts';
import { isPartCode, type PartCode } from '../data/partsOfSpeech.ts';
import { parseGapWord, parseSentence, type GapWord, type Token } from './parse.ts';

export const SERIES_LENGTH = 8;
/** Ile poprawnych na 8, żeby zaliczyć kropkę. */
export const PASS_SCORE = 6;

/**
 * Każde zadanie ma `item`: stały identyfikator, po którym zapamiętujemy błędy i powtórki.
 * Zdania i wyrazy wskazujemy numerem w banku, dlatego nowe treści DOPISUJEMY NA KOŃCU banku.
 *   m:<zdanie>:<części>          zaznacz w zdaniu
 *   c:<zdanie>:<wyraz>:<opcje>   wybór części mowy
 *   g:<zestaw>:<wyraz>           luka ortograficzna
 */
export type MarkTask = { kind: 'mark'; item: string; tokens: Token[]; targets: Set<number>; parts: PartCode[] };
export type ChooseTask = { kind: 'choose'; item: string; tokens: Token[]; index: number; answer: PartCode; options: PartCode[] };
export type GapTask = { kind: 'gap'; item: string; set: OrthoSetId; word: GapWord; options: readonly string[] };
export type Task = MarkTask | ChooseTask | GapTask;

const PARSED = SENTENCES.map(parseSentence);

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function markTask(s: number, parts: PartCode[]): MarkTask | null {
  const tokens = PARSED[s];
  if (!tokens) return null;
  const targets = new Set(tokens.flatMap((t, i) => (t.part && parts.includes(t.part) ? [i] : [])));
  if (targets.size === 0) return null;
  return { kind: 'mark', item: `m:${s}:${parts.join('+')}`, tokens, targets, parts };
}

function chooseTask(s: number, index: number, options: PartCode[]): ChooseTask | null {
  const tokens = PARSED[s];
  const part = tokens?.[index]?.part;
  if (!part || !options.includes(part)) return null;
  return { kind: 'choose', item: `c:${s}:${index}:${options.join('+')}`, tokens, index, answer: part, options };
}

function gapTask(set: OrthoSetId, w: number): GapTask | null {
  const src = ORTHO_SETS[set]?.words[w];
  if (!src) return null;
  return { kind: 'gap', item: `g:${set}:${w}`, set, word: parseGapWord(src), options: ORTHO_SETS[set].options };
}

/** Odtwarza zadanie z identyfikatora (do treningu słabych stron). Zwraca null dla nieznanego. */
export function taskFromItem(item: string): Task | null {
  const [kind, a, b, c] = item.split(':');
  const codes = (x: string | undefined) => (x ?? '').split('+').filter(isPartCode);
  if (kind === 'm') return markTask(Number(a), codes(b));
  if (kind === 'c') return chooseTask(Number(a), Number(b), codes(c));
  if (kind === 'g' && a in ORTHO_SETS) return gapTask(a as OrthoSetId, Number(b));
  return null;
}

/**
 * „Wybór”: wyróżniony wyraz w zdaniu, uczeń wskazuje część mowy.
 * Części mowy z `ask` pojawiają się na zmianę (przeplatanie), każde zdanie najwyżej raz w serii.
 */
function buildChoose(ask: PartCode[], options: PartCode[], rnd: () => number): ChooseTask[] {
  const queues = new Map<PartCode, ChooseTask[]>(ask.map((p) => [p, []]));
  PARSED.forEach((tokens, s) =>
    tokens.forEach((t, index) => {
      if (t.part && queues.has(t.part)) queues.get(t.part)!.push(chooseTask(s, index, options)!);
    }),
  );
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
      out.push(c);
    }
  }
  return shuffle(out, rnd);
}

/** Losuje serię zadań dla kropki. Kropka „learn” nie ma zadań. */
export function buildSeries(dot: Dot, rnd: () => number = Math.random): Task[] {
  switch (dot.kind) {
    case 'learn':
    case 'training':
      return [];
    case 'choose':
      return buildChoose(dot.ask, dot.options, rnd);
    case 'mark': {
      const pool = PARSED.map((_, s) => markTask(s, dot.targets)).filter((t): t is MarkTask => t !== null);
      return shuffle(pool, rnd).slice(0, SERIES_LENGTH);
    }
    case 'gap': {
      const pool = ORTHO_SETS[dot.set].words.map((_, w) => gapTask(dot.set, w)!);
      return shuffle(pool, rnd).slice(0, SERIES_LENGTH);
    }
  }
}

export type MarkResult = { correct: boolean; hits: number[]; missed: number[]; wrong: number[] };

/** Porównuje zaznaczone wyrazy z oczekiwanymi. */
export function checkMark(task: MarkTask, selected: Set<number>): MarkResult {
  const hits = [...selected].filter((i) => task.targets.has(i));
  const wrong = [...selected].filter((i) => !task.targets.has(i));
  const missed = [...task.targets].filter((i) => !selected.has(i));
  return { correct: wrong.length === 0 && missed.length === 0, hits, missed, wrong };
}

/** Klucz statystyki: część mowy albo zestaw ortograficzny. */
export function statKeyOf(task: Task): string {
  if (task.kind === 'mark') return task.parts.join('+');
  if (task.kind === 'choose') return task.answer;
  return task.set;
}

/** Lekcje do przypomnienia dla zadania. */
export function lessonsForTask(task: Task): string[] {
  if (task.kind === 'mark') return task.parts;
  if (task.kind === 'choose') return task.options;
  return [task.set];
}
