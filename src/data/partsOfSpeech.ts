/** Części mowy używane w banku zdań. Kod to skrót wpisywany po kresce: `kot|R`. */
export const PARTS = {
  R: { name: 'rzeczownik', plural: 'rzeczowniki', question: 'kto? co?', color: 'sky' },
  C: { name: 'czasownik', plural: 'czasowniki', question: 'co robi? co się z nim dzieje?', color: 'rose' },
  P: { name: 'przymiotnik', plural: 'przymiotniki', question: 'jaki? jaka? jakie?', color: 'emerald' },
  L: { name: 'liczebnik', plural: 'liczebniki', question: 'ile? który z kolei?', color: 'amber' },
  Pr: { name: 'przysłówek', plural: 'przysłówki', question: 'jak? gdzie? kiedy?', color: 'violet' },
  Z: { name: 'zaimek', plural: 'zaimki', question: 'zastępuje inną część mowy (ja, ty, on, ten, nasz…)', color: 'teal' },
  Pi: { name: 'przyimek', plural: 'przyimki', question: 'stoi przed rzeczownikiem: na, w, pod, za, z…', color: 'orange' },
  S: { name: 'spójnik', plural: 'spójniki', question: 'łączy wyrazy i zdania: i, a, ale, lub…', color: 'lime' },
} as const;

export type PartCode = keyof typeof PARTS;

export function isPartCode(code: string): code is PartCode {
  return Object.hasOwn(PARTS, code);
}
