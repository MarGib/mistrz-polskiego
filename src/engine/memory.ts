/**
 * Pamięć zdań i wyrazów: powtórki w odstępach (pudełka Leitnera).
 * Dobra odpowiedź przesuwa do wyższego pudełka (dłuższa przerwa), błąd wraca do pudełka 0 (powtórka od razu).
 */
export type ItemState = { box: number; right: number; wrong: number; due: string };

/** Przerwa w dniach dla pudełek 0–5. */
export const INTERVALS = [0, 1, 2, 4, 8, 16];

export function reviewItem(s: ItemState | undefined, ok: boolean, now = new Date()): ItemState {
  const prev = s ?? { box: 0, right: 0, wrong: 0, due: now.toISOString() };
  const box = ok ? Math.min(prev.box + 1, INTERVALS.length - 1) : 0;
  const due = new Date(now);
  due.setDate(due.getDate() + INTERVALS[box]);
  return { box, right: prev.right + (ok ? 1 : 0), wrong: prev.wrong + (ok ? 0 : 1), due: due.toISOString() };
}

/** Słaba strona: kiedyś był błąd i jeszcze nie jest dobrze utrwalone (pudełko < 3). */
export const isWeak = (s: ItemState) => s.wrong > 0 && s.box < 3;

/** Czy już czas na powtórkę. */
export const isDue = (s: ItemState, now = new Date()) => new Date(s.due) <= now;
