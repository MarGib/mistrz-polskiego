import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SENTENCES } from '../data/sentences.ts';
import { ORTHO_SETS } from '../data/orthography.ts';
import { ALL_DOTS } from '../data/modules.ts';
import { parseGapWord, parseSentence } from './parse.ts';
import { buildSeries, checkMark, SERIES_LENGTH, type MarkTask } from './series.ts';
import { emptyProgress, loadProgress, recordSeries, saveProgress, STORAGE_KEY } from './storage.ts';
import { isUnlocked } from './path.ts';

test('każde zdanie w banku da się odczytać, a każdy wyraz ma kod', () => {
  for (const s of SENTENCES) {
    const tokens = parseSentence(s);
    for (const t of tokens) {
      if (!t.punct) assert.ok(t.part, `wyraz bez kodu: „${t.text}” w „${s}”`);
    }
    assert.ok(tokens.at(-1)?.punct, `zdanie bez kropki na końcu: „${s}”`);
  }
});

test('bank zdań nie ma powtórzeń', () => {
  assert.equal(new Set(SENTENCES).size, SENTENCES.length);
});

test('każda kropka ma pełną serię zadań', () => {
  for (const dot of ALL_DOTS) {
    assert.equal(buildSeries(dot).length, SERIES_LENGTH, `za mało zadań w kropce ${dot.id}`);
  }
});

test('wyrazy ortograficzne mają lukę z dozwoloną odpowiedzią', () => {
  for (const set of Object.values(ORTHO_SETS)) {
    for (const w of set.words) {
      const g = parseGapWord(w);
      assert.ok((set.options as readonly string[]).includes(g.answer), `zła odpowiedź w „${w}”`);
      assert.ok(!/[[\]]/.test(g.after));
    }
  }
});

test('parseGapWord', () => {
  assert.deepEqual(parseGapWord('g[ó]ra'), { before: 'g', answer: 'ó', after: 'ra' });
  assert.deepEqual(parseGapWord('dro[ż]d[ż]e'), { before: 'dro', answer: 'ż', after: 'dże' });
});

test('checkMark rozróżnia trafione, pominięte i błędne', () => {
  const tokens = parseSentence('Mały|P kot|R śpi|C na|Pi kanapie|R .');
  const task: MarkTask = { kind: 'mark', tokens, targets: new Set([1, 4]) };
  assert.equal(checkMark(task, new Set([1, 4])).correct, true);
  const r = checkMark(task, new Set([1, 2]));
  assert.equal(r.correct, false);
  assert.deepEqual(r.hits, [1]);
  assert.deepEqual(r.wrong, [2]);
  assert.deepEqual(r.missed, [4]);
});

test('postęp: zapis, odczyt i odporność na zepsute dane', () => {
  const mem = new Map<string, string>();
  const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
  let p = recordSeries(emptyProgress(), 'm1-r', 7, 6, [{ key: 'R', ok: true }, { key: 'R', ok: false }]);
  saveProgress(p, storage);
  p = loadProgress(storage);
  assert.deepEqual(p.dots['m1-r'], { best: 7, passed: true, plays: 1 });
  assert.deepEqual(p.stats.R, { ok: 1, total: 2 });
  mem.set(STORAGE_KEY, '{zepsute');
  assert.deepEqual(loadProgress(storage), emptyProgress());
});

test('ścieżka: kropki odblokowują się po kolei, ortografia od razu', () => {
  const p = emptyProgress();
  assert.equal(isUnlocked('m1-r', p), true);
  assert.equal(isUnlocked('m1-c', p), false);
  assert.equal(isUnlocked('o1-ou', p), true);
  assert.equal(isUnlocked('o1-rz', p), false);
  const p2 = recordSeries(p, 'm1-r', 8, 6, []);
  assert.equal(isUnlocked('m1-c', p2), true);
});
