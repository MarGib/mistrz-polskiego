/**
 * Postęp ucznia: tylko na tym urządzeniu (localStorage). Nic nie wychodzi do internetu.
 * Klucz ma wersję, żeby przy zmianie formatu dało się dane bezpiecznie przenieść.
 */
import type { PartCode } from '../data/partsOfSpeech.ts';

export const STORAGE_KEY = 'mp_progress_v1';

export type DotProgress = { best: number; passed: boolean; plays: number };
export type Progress = {
  dots: Record<string, DotProgress>;
  /** Trafność per część mowy / zestaw ortograficzny: ile dobrze, ile razy. */
  stats: Record<string, { ok: number; total: number }>;
  /** Ostatnie serie (najnowsze na końcu, najwyżej 200). */
  history: { dot: string; score: number; at: string }[];
};

export const emptyProgress = (): Progress => ({ dots: {}, stats: {}, history: [] });

export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Progress {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const p = JSON.parse(raw) as Partial<Progress>;
    return { dots: p.dots ?? {}, stats: p.stats ?? {}, history: p.history ?? [] };
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

/** Dopisuje wynik serii. Zwraca nowy obiekt (nie zmienia starego). */
export function recordSeries(
  p: Progress,
  dotId: string,
  score: number,
  passScore: number,
  answers: { key: PartCode | string; ok: boolean }[],
  now = new Date(),
): Progress {
  const prev = p.dots[dotId] ?? { best: 0, passed: false, plays: 0 };
  const stats = { ...p.stats };
  for (const a of answers) {
    const s = stats[a.key] ?? { ok: 0, total: 0 };
    stats[a.key] = { ok: s.ok + (a.ok ? 1 : 0), total: s.total + 1 };
  }
  return {
    dots: {
      ...p.dots,
      [dotId]: { best: Math.max(prev.best, score), passed: prev.passed || score >= passScore, plays: prev.plays + 1 },
    },
    stats,
    history: [...p.history, { dot: dotId, score, at: now.toISOString() }].slice(-200),
  };
}

/** Prosi przeglądarkę, żeby nie czyściła danych aplikacji przy braku miejsca. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
