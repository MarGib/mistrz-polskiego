import { ALL_DOTS } from '../data/modules.ts';
import type { Progress } from './storage.ts';

/**
 * Kropki odblokowują się po kolei w każdym module. Ortografia ma własną ścieżkę,
 * więc można ją ćwiczyć równolegle z gramatyką.
 */
export function isUnlocked(dotId: string, p: Progress): boolean {
  const idx = ALL_DOTS.findIndex((d) => d.id === dotId);
  if (idx <= 0) return true;
  const dot = ALL_DOTS[idx];
  if (dot.kind === 'gap' && ALL_DOTS[idx - 1].kind !== 'gap') return true;
  return p.dots[ALL_DOTS[idx - 1].id]?.passed ?? false;
}
