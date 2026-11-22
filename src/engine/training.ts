import { isDue, isWeak } from './memory.ts';
import { SERIES_LENGTH, taskFromItem, type Task } from './series.ts';
import type { Progress } from './storage.ts';

/** Słabe strony ucznia: zdania i wyrazy z błędami, które nie są jeszcze utrwalone. */
export function weakItems(p: Progress): string[] {
  return Object.entries(p.items)
    .filter(([, s]) => isWeak(s))
    .map(([id]) => id);
}

/**
 * Trening słabych stron: najpierw to, na co już czas (najniższe pudełko, najwięcej błędów),
 * potem pozostałe słabe strony. Zwraca pustą listę, gdy nie ma czego poprawiać.
 */
export function buildTraining(p: Progress, now = new Date()): Task[] {
  const entries = Object.entries(p.items).filter(([, s]) => isWeak(s));
  entries.sort(([, a], [, b]) => Number(isDue(b, now)) - Number(isDue(a, now)) || a.box - b.box || b.wrong - a.wrong);
  const out: Task[] = [];
  for (const [id] of entries) {
    const t = taskFromItem(id);
    if (t) out.push(t);
    if (out.length >= SERIES_LENGTH) break;
  }
  return out;
}
