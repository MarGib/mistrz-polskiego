import type { AnswerRecord } from './storage.ts';

/** Punkty: 10 za poprawną, +5 za każdą kolejną z rzędu od trzeciej, 15 w treningu, +20 za serię bez błędu. */
export function pointsFor(answers: AnswerRecord[], perfect: boolean): number {
  let pts = 0;
  let streak = 0;
  for (const a of answers) {
    if (a.ok) {
      streak++;
      pts += a.training ? 15 : 10;
      if (streak >= 3) pts += 5;
    } else {
      streak = 0;
    }
  }
  return pts + (perfect ? 20 : 0);
}

/** Tytuły za punkty. Najwyższy to Mistrz Słowa. */
export const TITLES = [
  { min: 0, name: 'Nowicjusz', emoji: '🌱' },
  { min: 300, name: 'Odkrywca Słów', emoji: '🔎' },
  { min: 1000, name: 'Znawca Zdań', emoji: '📘' },
  { min: 2500, name: 'Strażnik Ortografii', emoji: '🛡️' },
  { min: 5000, name: 'Mistrz Słowa', emoji: '👑' },
];

export function titleFor(points: number) {
  let i = 0;
  while (i + 1 < TITLES.length && points >= TITLES[i + 1].min) i++;
  const next = TITLES[i + 1];
  return { ...TITLES[i], next, toNext: next ? next.min - points : 0, progress: next ? (points - TITLES[i].min) / (next.min - TITLES[i].min) : 1 };
}
