import { ALL_DOTS } from '../data/modules.ts';
import type { Progress } from './storage.ts';
import { streakDays } from './storage.ts';

export type Badge = { id: string; emoji: string; name: string; how: string; earned: (p: Progress) => boolean };

const correct = (p: Progress, key: string) => p.stats[key]?.ok ?? 0;
const accuracy = (p: Progress, key: string) => {
  const s = p.stats[key];
  return s && s.total ? s.ok / s.total : 0;
};
const expert = (key: string) => (p: Progress) => correct(p, key) >= 30 && accuracy(p, key) >= 0.8;
const passedAll = (ids: string[]) => (p: Progress) => ids.every((id) => p.dots[id]?.passed);

/** Odznaki. Kolejność = kolejność w gablocie. */
export const BADGES: Badge[] = [
  { id: 'first', emoji: '👣', name: 'Pierwszy krok', how: 'Ukończ pierwszą serię.', earned: (p) => Object.keys(p.days).length > 0 },
  { id: 'perfect', emoji: '💯', name: 'Bez pudła', how: 'Zrób serię 8/8 bez błędu.', earned: (p) => p.history.some((h) => h.score >= 8) },
  { id: 'streak3', emoji: '🔥', name: 'Trzy dni z rzędu', how: 'Ćwicz 3 dni z rzędu.', earned: (p) => streakDays(p) >= 3 || longestStreak(p) >= 3 },
  { id: 'streak7', emoji: '📅', name: 'Tydzień nauki', how: 'Ćwicz 7 dni z rzędu.', earned: (p) => longestStreak(p) >= 7 },
  { id: 'fixer', emoji: '🛠️', name: 'Pogromca błędów', how: 'Popraw 10 słabych stron w treningu.', earned: (p) => p.fixed >= 10 },
  { id: 'R', emoji: '🐱', name: 'Znawca rzeczowników', how: '30 dobrych odpowiedzi o rzeczownikach, trafność min. 80%.', earned: expert('R') },
  { id: 'C', emoji: '🏃', name: 'Znawca czasowników', how: '30 dobrych odpowiedzi o czasownikach, trafność min. 80%.', earned: expert('C') },
  { id: 'P', emoji: '🎨', name: 'Znawca przymiotników', how: '30 dobrych odpowiedzi o przymiotnikach, trafność min. 80%.', earned: expert('P') },
  { id: 'Pr', emoji: '💨', name: 'Znawca przysłówków', how: '30 dobrych odpowiedzi o przysłówkach, trafność min. 80%.', earned: expert('Pr') },
  { id: 'ou', emoji: '✏️', name: 'Pogromca ó i u', how: '30 dobrze uzupełnionych wyrazów z ó/u, trafność min. 80%.', earned: expert('o-u') },
  { id: 'rz', emoji: '🖋️', name: 'Pogromca rz i ż', how: '30 dobrze uzupełnionych wyrazów z rz/ż, trafność min. 80%.', earned: expert('rz-z') },
  { id: 'm1', emoji: '🥉', name: 'Moduł 1 zaliczony', how: 'Zalicz wszystkie kropki modułu 1.', earned: passedAll(ALL_DOTS.filter((d) => d.id.startsWith('m1-')).map((d) => d.id)) },
  { id: 'm2', emoji: '🥈', name: 'Moduł 2 zaliczony', how: 'Zalicz wszystkie kropki modułu 2.', earned: passedAll(ALL_DOTS.filter((d) => d.id.startsWith('m2-')).map((d) => d.id)) },
  { id: 'm3', emoji: '🥇', name: 'Moduł 3 zaliczony', how: 'Zalicz wszystkie kropki modułu 3.', earned: passedAll(ALL_DOTS.filter((d) => d.id.startsWith('m3-')).map((d) => d.id)) },
  { id: 'master', emoji: '👑', name: 'Mistrz Słowa', how: 'Zalicz całą ścieżkę: wszystkie moduły i ortografię.', earned: passedAll(ALL_DOTS.map((d) => d.id)) },
];

export function longestStreak(p: Progress): number {
  const days = Object.keys(p.days).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const d = new Date(k + 'T12:00:00');
    run = prev && Math.round((d.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export const earnedBadges = (p: Progress) => BADGES.filter((b) => b.earned(p));

/** Odznaki zdobyte między dwoma stanami (do świętowania na ekranie wyniku). */
export function newBadges(before: Progress, after: Progress): Badge[] {
  const had = new Set(earnedBadges(before).map((b) => b.id));
  return earnedBadges(after).filter((b) => !had.has(b.id));
}
