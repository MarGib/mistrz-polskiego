import type { PartCode } from './partsOfSpeech.ts';
import type { OrthoSetId } from './orthography.ts';

/** Kropka na ścieżce: jedno ćwiczenie (seria zadań). */
export type Dot =
  | { id: string; kind: 'mark'; title: string; targets: PartCode[] }
  | { id: string; kind: 'gap'; title: string; set: OrthoSetId };

export type Module = { id: string; title: string; emoji: string; dots: Dot[] };

/** Pierwsza wersja: moduły 1–3 oraz ortografia ó/u i rz/ż. */
export const MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Rzeczownik, czasownik, przymiotnik',
    emoji: '🐱',
    dots: [
      { id: 'm1-r', kind: 'mark', title: 'Znajdź rzeczowniki', targets: ['R'] },
      { id: 'm1-c', kind: 'mark', title: 'Znajdź czasowniki', targets: ['C'] },
      { id: 'm1-p', kind: 'mark', title: 'Znajdź przymiotniki', targets: ['P'] },
    ],
  },
  {
    id: 'm2',
    title: 'Liczebnik i przysłówek',
    emoji: '🔢',
    dots: [
      { id: 'm2-l', kind: 'mark', title: 'Znajdź liczebniki', targets: ['L'] },
      { id: 'm2-pr', kind: 'mark', title: 'Znajdź przysłówki', targets: ['Pr'] },
    ],
  },
  {
    id: 'm3',
    title: 'Zaimek i przyimek',
    emoji: '👉',
    dots: [
      { id: 'm3-z', kind: 'mark', title: 'Znajdź zaimki', targets: ['Z'] },
      { id: 'm3-pi', kind: 'mark', title: 'Znajdź przyimki', targets: ['Pi'] },
    ],
  },
  {
    id: 'o1',
    title: 'Ortografia',
    emoji: '✍️',
    dots: [
      { id: 'o1-ou', kind: 'gap', title: 'ó czy u?', set: 'o-u' },
      { id: 'o1-rz', kind: 'gap', title: 'rz czy ż?', set: 'rz-z' },
    ],
  },
];

export const ALL_DOTS: Dot[] = MODULES.flatMap((m) => m.dots);
