import type { PartCode } from './partsOfSpeech.ts';
import type { OrthoSetId } from './orthography.ts';
import type { LessonId } from './lessons.ts';

/** Kropka na ścieżce: lekcja albo jedno ćwiczenie (seria zadań). */
export type Dot =
  | { id: string; kind: 'learn'; title: string; lessons: LessonId[] }
  | { id: string; kind: 'mark'; title: string; targets: PartCode[] }
  | { id: string; kind: 'choose'; title: string; ask: PartCode[]; options: PartCode[] }
  | { id: string; kind: 'gap'; title: string; set: OrthoSetId };

/** `independent`: pierwsza kropka modułu jest otwarta od razu (nie czeka na poprzedni moduł). */
export type Module = { id: string; title: string; emoji: string; independent?: boolean; dots: Dot[] };

/** Pierwsza wersja: moduły 1–3 oraz ortografia ó/u i rz/ż. */
export const MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Rzeczownik, czasownik, przymiotnik',
    emoji: '🐱',
    dots: [
      { id: 'm1-learn', kind: 'learn', title: 'Poznaj: rzeczownik, czasownik, przymiotnik', lessons: ['R', 'C', 'P'] },
      { id: 'm1-r', kind: 'mark', title: 'Znajdź rzeczowniki', targets: ['R'] },
      { id: 'm1-c', kind: 'mark', title: 'Znajdź czasowniki', targets: ['C'] },
      { id: 'm1-p', kind: 'mark', title: 'Znajdź przymiotniki', targets: ['P'] },
      { id: 'm1-w', kind: 'choose', title: 'Jaka to część mowy?', ask: ['R', 'C', 'P'], options: ['R', 'C', 'P'] },
    ],
  },
  {
    id: 'm2',
    title: 'Liczebnik i przysłówek',
    emoji: '🔢',
    dots: [
      { id: 'm2-learn', kind: 'learn', title: 'Poznaj: liczebnik i przysłówek', lessons: ['L', 'Pr'] },
      { id: 'm2-l', kind: 'mark', title: 'Znajdź liczebniki', targets: ['L'] },
      { id: 'm2-pr', kind: 'mark', title: 'Znajdź przysłówki', targets: ['Pr'] },
      // Przymiotnik w pytaniach, bo najczęściej mylimy go z przysłówkiem i liczebnikiem porządkowym.
      { id: 'm2-w', kind: 'choose', title: 'Przysłówek, przymiotnik czy liczebnik?', ask: ['L', 'Pr', 'P'], options: ['R', 'C', 'P', 'L', 'Pr'] },
    ],
  },
  {
    id: 'm3',
    title: 'Zaimek i przyimek',
    emoji: '👉',
    dots: [
      { id: 'm3-learn', kind: 'learn', title: 'Poznaj: zaimek i przyimek', lessons: ['Z', 'Pi'] },
      { id: 'm3-z', kind: 'mark', title: 'Znajdź zaimki', targets: ['Z'] },
      { id: 'm3-pi', kind: 'mark', title: 'Znajdź przyimki', targets: ['Pi'] },
      { id: 'm3-w', kind: 'choose', title: 'Jaka to część mowy? Wszystkie', ask: ['R', 'C', 'P', 'L', 'Pr', 'Z', 'Pi'], options: ['R', 'C', 'P', 'L', 'Pr', 'Z', 'Pi'] },
    ],
  },
  {
    id: 'o1',
    title: 'Ortografia',
    emoji: '✍️',
    independent: true,
    dots: [
      { id: 'o1-learn-ou', kind: 'learn', title: 'Poznaj: ó czy u?', lessons: ['o-u'] },
      { id: 'o1-ou', kind: 'gap', title: 'Ćwicz: ó czy u?', set: 'o-u' },
      { id: 'o1-learn-rz', kind: 'learn', title: 'Poznaj: rz czy ż?', lessons: ['rz-z'] },
      { id: 'o1-rz', kind: 'gap', title: 'Ćwicz: rz czy ż?', set: 'rz-z' },
    ],
  },
];

export const ALL_DOTS: Dot[] = MODULES.flatMap((m) => m.dots);

/** Lekcje związane z kropką (do przycisku „Przypomnij”). */
export function lessonsFor(dot: Dot): LessonId[] {
  switch (dot.kind) {
    case 'learn': return dot.lessons;
    case 'mark': return dot.targets;
    case 'choose': return dot.options;
    case 'gap': return [dot.set];
  }
}
