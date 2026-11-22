import { ALL_DOTS, MODULES } from '../data/modules.ts';
import type { Progress } from './storage.ts';

/**
 * Kropki odblokowują się po kolei. Moduł oznaczony `independent` (ortografia)
 * zaczyna się od razu, więc można go ćwiczyć równolegle z gramatyką.
 */
export function isUnlocked(dotId: string, p: Progress): boolean {
  const idx = ALL_DOTS.findIndex((d) => d.id === dotId);
  if (idx <= 0) return true;
  if (MODULES.some((m) => m.independent && m.dots[0].id === dotId)) return true;
  return p.dots[ALL_DOTS[idx - 1].id]?.passed ?? false;
}
