/**
 * Postęp ucznia: tylko na tym urządzeniu (localStorage). Nic nie wychodzi do internetu.
 * Klucz ma wersję, żeby przy zmianie formatu dało się dane bezpiecznie przenieść.
 */
import { reviewItem, type ItemState } from './memory.ts';
import { pointsFor } from './points.ts';

export const STORAGE_KEY = 'mp_progress_v1';

export type DotProgress = { best: number; passed: boolean; plays: number };
export type Progress = {
  dots: Record<string, DotProgress>;
  /** Trafność per część mowy / zestaw ortograficzny: ile dobrze, ile razy. */
  stats: Record<string, { ok: number; total: number }>;
  /** Ostatnie serie (najnowsze na końcu, najwyżej 200). */
  history: { dot: string; score: number; at: string; points?: number }[];
  /** Pamięć każdego zdania i wyrazu (powtórki w odstępach). */
  items: Record<string, ItemState>;
  points: number;
  /** Aktywność dzienna: RRRR-MM-DD → liczba odpowiedzi i poprawnych. */
  days: Record<string, { answers: number; ok: number }>;
  /** Pomyłki w „Wyborze”: „Pr>P” = przysłówek wzięty za przymiotnik. */
  confusions: Record<string, number>;
  /** Ile słabych stron poprawiono w treningu. */
  fixed: number;
};

export const emptyProgress = (): Progress => ({
  dots: {}, stats: {}, history: [], items: {}, points: 0, days: {}, confusions: {}, fixed: 0,
});

export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Progress {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Pełna pamięć albo tryb prywatny: gra działa dalej, tylko bez zapisu.
  }
}

/** Data lokalna RRRR-MM-DD. */
export function dayKey(d: Date): string {
  return d.toLocaleDateString('sv-SE');
}

export type AnswerRecord = {
  item?: string;
  key: string;
  ok: boolean;
  /** Dla „Wyboru”: co uczeń wskazał (do mapy pomyłek). */
  picked?: string;
  /** Odpowiedź z treningu słabych stron. */
  training?: boolean;
};

/** Dopisuje wynik serii. Zwraca nowy obiekt (nie zmienia starego). */
export function recordSeries(
  p: Progress,
  dotId: string,
  score: number,
  passScore: number,
  answers: AnswerRecord[],
  now = new Date(),
): Progress {
  const prev = p.dots[dotId] ?? { best: 0, passed: false, plays: 0 };
  const stats = { ...p.stats };
  const items = { ...p.items };
  const confusions = { ...p.confusions };
  let fixed = p.fixed;
  for (const a of answers) {
    const s = stats[a.key] ?? { ok: 0, total: 0 };
    stats[a.key] = { ok: s.ok + (a.ok ? 1 : 0), total: s.total + 1 };
    if (a.item) {
      const before = items[a.item];
      items[a.item] = reviewItem(before, a.ok, now);
      if (a.training && a.ok && before && before.wrong > 0) fixed++;
    }
    if (!a.ok && a.picked) confusions[`${a.key}>${a.picked}`] = (confusions[`${a.key}>${a.picked}`] ?? 0) + 1;
  }
  const gained = answers.length ? pointsFor(answers, score === answers.length && answers.length >= 8) : 0;
  const day = dayKey(now);
  const d = p.days[day] ?? { answers: 0, ok: 0 };
  return {
    ...p,
    dots: {
      ...p.dots,
      [dotId]: { best: Math.max(prev.best, score), passed: prev.passed || score >= passScore, plays: prev.plays + 1 },
    },
    stats,
    items,
    confusions,
    fixed,
    points: p.points + gained,
    days: answers.length ? { ...p.days, [day]: { answers: d.answers + answers.length, ok: d.ok + answers.filter((a) => a.ok).length } } : p.days,
    history: [...p.history, { dot: dotId, score, at: now.toISOString(), points: gained }].slice(-200),
  };
}

/** Ile dni z rzędu (do dziś albo do wczoraj) uczeń ćwiczył. */
export function streakDays(p: Progress, now = new Date()): number {
  const d = new Date(now);
  if (!p.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (p.days[dayKey(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Prosi przeglądarkę, żeby nie czyściła danych aplikacji przy braku miejsca. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
