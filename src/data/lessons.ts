/**
 * Wiedza („Poznaj”): krótkie lekcje przed ćwiczeniami i do przypomnienia w każdej chwili.
 * W tekstach `*wyraz*` oznacza wyróżnienie (pogrubienie w kolorze).
 */
import type { PartCode } from './partsOfSpeech.ts';
import type { OrthoSetId } from './orthography.ts';

export type LessonId = PartCode | OrthoSetId;

export type Lesson = {
  title: string;
  emoji: string;
  /** Jedno–dwa zdania: czym to jest. */
  what: string;
  /** Pytania pomocnicze (dla części mowy). */
  questions?: string;
  examples: string[];
  /** Najważniejsze informacje albo zasady. */
  facts: string[];
  /** Pułapka: częsty błąd. */
  trap: string;
};

export const LESSONS: Partial<Record<LessonId, Lesson>> = {
  R: {
    title: 'Rzeczownik',
    emoji: '🐱',
    what: 'Rzeczownik to nazwa. Nazywa osoby, zwierzęta, rośliny, rzeczy, miejsca, zjawiska, a nawet uczucia.',
    questions: 'kto? co?',
    examples: ['*Mama* czyta *gazetę*.', '*Pies* biegnie po *łące*.', 'Nad *Krakowem* szaleje *burza*.'],
    facts: [
      'Odmienia się przez przypadki (kto? kogo? komu?…) i przez liczby (kot – koty).',
      'Ma rodzaj: męski (ten stół), żeński (ta lampa) albo nijaki (to okno).',
      'Sztuczka: jeśli przed wyrazem pasuje „ten”, „ta” albo „to”, to najpewniej rzeczownik.',
    ],
    trap: 'Rzeczownikami są też nazwy uczuć i czynności: *radość*, *strach*, *bieganie*. Nie da się ich dotknąć, ale odpowiadają na pytanie „co?”.',
  },
  C: {
    title: 'Czasownik',
    emoji: '🏃',
    what: 'Czasownik mówi, co ktoś robi albo co się z nim dzieje.',
    questions: 'co robi? co się z nim dzieje?',
    examples: ['Kot *śpi* na kanapie.', 'Dzieci *budują* zamek.', 'Za oknem *pada* deszcz.'],
    facts: [
      'Odmienia się przez osoby (ja czytam, ty czytasz, on czyta) i przez liczby (czyta – czytają).',
      'Ma czasy: przeszły (czytałem), teraźniejszy (czytam) i przyszły (będę czytać).',
      'Forma podstawowa to bezokolicznik: czytać, biec, spać.',
    ],
    trap: 'Czasownikami są też wyrazy, które nie oznaczają ruchu: *być*, *mieć*, *leżeć*, *spać*, *myśleć*.',
  },
  P: {
    title: 'Przymiotnik',
    emoji: '🎨',
    what: 'Przymiotnik opisuje rzeczownik: mówi, jaki on jest (kolor, wygląd, kształt, charakter).',
    questions: 'jaki? jaka? jakie?',
    examples: ['*Mały* kot śpi na *miękkiej* kanapie.', 'Babcia upiekła *pyszne* ciasto.', 'Mam *czerwony* plecak.'],
    facts: [
      'Stoi zwykle przy rzeczowniku i dopasowuje się do niego: mały kot, mała mysz, małe okno.',
      'Można go stopniować: ładny → ładniejszy → najładniejszy.',
    ],
    trap: 'Nie myl z przysłówkiem! Przymiotnik opisuje rzecz: *szybki* samochód. Przysłówek opisuje czynność: jedzie *szybko*.',
  },
  L: {
    title: 'Liczebnik',
    emoji: '🔢',
    what: 'Liczebnik mówi o liczbie: ile czegoś jest albo które coś jest z kolei.',
    questions: 'ile? który z kolei?',
    examples: ['*Trzy* wróble siedzą na płocie.', '*Drugi* pociąg przyjechał punktualnie.', 'Pająk ma *osiem* nóg.'],
    facts: [
      'Liczebniki główne odpowiadają na pytanie „ile?”: jeden, dwa, pięć, sto.',
      'Liczebniki porządkowe odpowiadają na pytanie „który z kolei?”: pierwszy, drugi, dziesiąty.',
    ],
    trap: '„Pierwszy” i „trzeci” wyglądają jak przymiotniki, ale odpowiadają na pytanie „który z kolei?”, więc są liczebnikami.',
  },
  Pr: {
    title: 'Przysłówek',
    emoji: '💨',
    what: 'Przysłówek opisuje czynność: mówi, jak, gdzie albo kiedy coś się dzieje.',
    questions: 'jak? gdzie? kiedy?',
    examples: ['Pies *głośno* szczeka.', 'Jedziemy *jutro* nad morze.', 'Ona *pięknie* śpiewa.'],
    facts: [
      'Stoi zwykle przy czasowniku.',
      'Często kończy się na -o albo -e: cicho, szybko, pięknie, mądrze.',
      'Nie odmienia się, ale wiele przysłówków można stopniować: szybko → szybciej → najszybciej.',
    ],
    trap: 'Sprawdź, co opisuje wyraz. *Wesoły* chłopiec (jaki? → przymiotnik), ale ptaki ćwierkają *wesoło* (jak? → przysłówek).',
  },
  Z: {
    title: 'Zaimek',
    emoji: '👉',
    what: 'Zaimek zastępuje inny wyraz, żeby się nie powtarzać. Zamiast „Ola czyta. Ola lubi książki” mówimy „Ola czyta. *Ona* lubi książki”.',
    questions: 'zastępuje rzeczownik, przymiotnik, liczebnik albo przysłówek',
    examples: ['*My* jedziemy nad morze.', '*Mój* dziadek hoduje pszczoły.', '*Ten* chłopiec ma czerwony plecak.'],
    facts: [
      'Osobowe: ja, ty, on, ona, ono, my, wy, oni, one (i ich formy: mnie, ciebie, jego…).',
      'Dzierżawcze, czyli czyje coś jest: mój, twój, swój, nasz, wasz.',
      'Wskazujące: ten, ta, to, tamten.',
    ],
    trap: '„Nasz”, „ten” i „mój” stoją przy rzeczowniku jak przymiotniki, ale są zaimkami: nie opisują cechy, tylko wskazują albo mówią, czyje coś jest.',
  },
  Pi: {
    title: 'Przyimek',
    emoji: '📦',
    what: 'Przyimek to krótki wyraz, który stoi przed rzeczownikiem albo zaimkiem. Pokazuje, gdzie, dokąd albo kiedy coś jest.',
    questions: 'na, w, pod, nad, za, przed, do, z, od, po, przy, przez, u',
    examples: ['Kot śpi *na* kanapie.', 'Wiewiórka zbiera orzechy *pod* dębem.', 'Wracamy *do* domu.'],
    facts: [
      'Nie odmienia się.',
      'Razem z rzeczownikiem tworzy wyrażenie przyimkowe: na stole, pod dębem, do domu.',
      'Czasem dostaje literę „e”: w → we (we wtorek), z → ze (ze mną).',
    ],
    trap: 'Przyimek piszemy osobno: *na* pewno, *do* widzenia, *w* domu.',
  },
  'o-u': {
    title: 'ó czy u?',
    emoji: '✍️',
    what: 'Ó i u brzmią tak samo. Pomagają zasady, a kilka wyrazów trzeba po prostu zapamiętać.',
    examples: ['st*ó*ł – stoły', 's*ó*l – solić', 'rys*u*nek', '*u*cho'],
    facts: [
      'Ó piszemy, gdy w innej formie wyrazu słychać o, e lub a: st*ó*ł – stoły, s*ó*l – solić, n*ó*ż – noże.',
      'Ó piszemy w zakończeniach -ów i -ówka: dom*ó*w, kresk*ó*wka, złot*ó*wka.',
      'U piszemy w zakończeniach -uje, -unek, -uszek, -uch: mal*u*je, rys*u*nek, kwiat*u*szek, len*u*ch.',
      'U piszemy zwykle na początku wyrazu: *u*cho, *u*l, *u*czeń.',
    ],
    trap: 'W niektórych wyrazach ó nie wymienia się na nic, np. g*ó*ra, ż*ó*łw, c*ó*rka, og*ó*rek. Te trzeba zapamiętać, a pomaga w tym ćwiczenie i czytanie.',
  },
  'rz-z': {
    title: 'rz czy ż?',
    emoji: '✍️',
    what: 'Rz i ż brzmią tak samo. Pomagają wymiany głosek i kilka zasad.',
    examples: ['mo*rz*e – morski', 'ksią*ż*ka – księga', 'd*rz*ewo', 'leka*rz*'],
    facts: [
      'Rz piszemy, gdy w innej formie słychać r: mo*rz*e – morski, na gó*rz*e – góra.',
      'Rz piszemy po spółgłoskach b, p, d, t, g, k, ch, w, j: b*rz*eg, p*rz*yjaciel, d*rz*ewo, t*rz*y, g*rz*yb, k*rz*esło, ch*rz*an.',
      'Rz piszemy w zakończeniach -arz i -erz w nazwach zawodów: leka*rz*, mala*rz*, ryce*rz*.',
      'Ż piszemy, gdy w innej formie słychać g, z, s, h albo dz: ksią*ż*ka – księga, mro*ż*ony – mróz, wy*ż*szy – wysoki.',
    ],
    trap: 'Wyjątki po spółgłoskach (piszemy sz, nie rz): pszczoła, pszenica, kształt. Są też wyrazy z ż, które trzeba zapamiętać: *ż*aba, *ż*ółw, *ż*yrafa, pla*ż*a.',
  },
};
