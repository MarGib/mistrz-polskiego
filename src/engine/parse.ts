import { isPartCode, type PartCode } from '../data/partsOfSpeech.ts';

export type Token = { text: string; part: PartCode | null; punct: boolean };

/** Zamienia zapis „Mały|P kot|R .” na listę tokenów. Rzuca błąd przy złym kodzie. */
export function parseSentence(src: string): Token[] {
  return src.trim().split(/\s+/).map((raw) => {
    const bar = raw.lastIndexOf('|');
    if (bar === -1) {
      const punct = /^[.,!?;:…–-]+$/.test(raw);
      return { text: raw, part: null, punct };
    }
    const text = raw.slice(0, bar);
    const code = raw.slice(bar + 1);
    if (!isPartCode(code)) throw new Error(`Nieznany kod części mowy „${code}” w „${src}”`);
    return { text, part: code, punct: false };
  });
}

export type GapWord = { before: string; answer: string; after: string };

/** Zamienia zapis „g[ó]ra” na części przed luką, odpowiedź i po luce (pierwsza luka). */
export function parseGapWord(src: string): GapWord {
  const m = /^(.*?)\[([^\]]+)\](.*)$/.exec(src);
  if (!m) throw new Error(`Brak luki w „${src}”`);
  return { before: m[1], answer: m[2], after: m[3].replace(/\[([^\]]+)\]/g, '$1') };
}
