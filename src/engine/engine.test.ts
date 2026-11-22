import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SENTENCES } from '../data/sentences.ts';
import { ORTHO_SETS } from '../data/orthography.ts';
import { ALL_DOTS, lessonsFor } from '../data/modules.ts';
import { LESSONS } from '../data/lessons.ts';
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
    if (dot.kind === 'learn') continue;
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
  const task: MarkTask = { kind: 'mark', item: 'test', tokens, targets: new Set([1, 4]), parts: ['R'] };
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
  assert.equal(isUnlocked('m1-learn', p), true);
  assert.equal(isUnlocked('m1-r', p), false);
  assert.equal(isUnlocked('o1-learn-ou', p), true);
  assert.equal(isUnlocked('o1-ou', p), false);
  const p2 = recordSeries(p, 'm1-learn', 1, 1, []);
  assert.equal(isUnlocked('m1-r', p2), true);
  assert.equal(isUnlocked('m1-c', p2), false);
});

test('każda kropka ma swoje lekcje w wiedzy', () => {
  for (const dot of ALL_DOTS) {
    for (const id of lessonsFor(dot)) assert.ok(LESSONS[id], `brak lekcji „${id}” dla kropki ${dot.id}`);
  }
});

test('wybór: wyróżniony wyraz ma właściwą część mowy, zdania się nie powtarzają', () => {
  for (const dot of ALL_DOTS) {
    if (dot.kind !== 'choose') continue;
    for (let n = 0; n < 20; n++) {
      const series = buildSeries(dot);
      assert.equal(series.length, SERIES_LENGTH);
      const seen = new Set<string>();
      for (const t of series) {
        assert.equal(t.kind, 'choose');
        if (t.kind !== 'choose') continue;
        assert.equal(t.tokens[t.index].part, t.answer);
        assert.ok(t.options.includes(t.answer));
        const key = t.tokens.map((x) => x.text).join(' ');
        assert.ok(!seen.has(key), 'zdanie powtórzone w serii');
        seen.add(key);
      }
      // przeplatanie: w serii są co najmniej dwie różne części mowy
      assert.ok(new Set(series.map((t) => (t.kind === 'choose' ? t.answer : ''))).size >= 2);
    }
  }
});

import { taskFromItem } from './series.ts';
import { reviewItem, isWeak } from './memory.ts';
import { pointsFor, titleFor } from './points.ts';
import { buildTraining, weakItems } from './training.ts';
import { BADGES, longestStreak, newBadges } from './badges.ts';
import { streakDays } from './storage.ts';

test('każde zadanie da się odtworzyć z identyfikatora (trening)', () => {
  for (const dot of ALL_DOTS) {
    for (const t of buildSeries(dot)) {
      const back = taskFromItem(t.item);
      assert.ok(back, `nie da się odtworzyć ${t.item}`);
      assert.equal(back.item, t.item);
    }
  }
  assert.equal(taskFromItem('m:9999:R'), null);
  assert.equal(taskFromItem('śmieci'), null);
});

test('pamięć: błąd wraca do pudełka 0, dobra odpowiedź przesuwa wyżej', () => {
  const now = new Date('2026-11-22T10:00:00');
  let s = reviewItem(undefined, false, now);
  assert.equal(s.box, 0);
  assert.ok(isWeak(s));
  s = reviewItem(s, true, now);
  s = reviewItem(s, true, now);
  s = reviewItem(s, true, now);
  assert.equal(s.box, 3);
  assert.ok(!isWeak(s));
  assert.equal(new Date(s.due).getDate(), 26); // pudełko 3 = 4 dni
});

test('punkty: 10 za dobrą, bonus za serię dobrych i za 8/8', () => {
  const ok = { key: 'R', ok: true };
  const bad = { key: 'R', ok: false };
  assert.equal(pointsFor([ok, ok, ok], false), 35);
  assert.equal(pointsFor([ok, bad, ok], false), 20);
  assert.equal(pointsFor(Array(8).fill(ok), true), 80 + 30 + 20);
  assert.equal(titleFor(0).name, 'Nowicjusz');
  assert.equal(titleFor(5000).name, 'Mistrz Słowa');
  assert.equal(titleFor(250).toNext, 50);
});

test('trening słabych stron: błędy trafiają do treningu, poprawione z niego znikają', () => {
  const series = buildSeries(ALL_DOTS.find((d) => d.id === 'm1-r')!);
  const now = new Date('2026-11-22T10:00:00');
  let p = recordSeries(emptyProgress(), 'm1-r', 6, 6, series.map((t, i) => ({ item: t.item, key: 'R', ok: i >= 2 })), now);
  assert.equal(weakItems(p).length, 2);
  const tr = buildTraining(p, now);
  assert.equal(tr.length, 2);
  for (let k = 0; k < 3; k++) {
    p = recordSeries(p, 'training', 2, 0, tr.map((t) => ({ item: t.item, key: 'R', ok: true, training: true })), now);
  }
  assert.equal(weakItems(p).length, 0);
  assert.equal(buildTraining(p, now).length, 0);
  assert.equal(p.fixed, 6);
});

test('dni z rzędu i odznaki', () => {
  const p = emptyProgress();
  for (const d of ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']) p.days[d] = { answers: 8, ok: 8 };
  assert.equal(streakDays(p, new Date('2026-11-22T20:00:00')), 4);
  assert.equal(streakDays(p, new Date('2026-11-23T08:00:00')), 4); // dziś jeszcze nie ćwiczył
  assert.equal(streakDays(p, new Date('2026-11-25T08:00:00')), 0);
  assert.equal(longestStreak(p), 4);
  const after = recordSeries(emptyProgress(), 'm1-r', 8, 6, Array(8).fill({ key: 'R', ok: true }));
  const got = newBadges(emptyProgress(), after).map((b) => b.id);
  assert.ok(got.includes('first') && got.includes('perfect'));
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
});

test('stary zapis (bez nowych pól) wczytuje się bez błędu', () => {
  const mem = new Map([[STORAGE_KEY, JSON.stringify({ dots: { 'm1-r': { best: 7, passed: true, plays: 1 } }, stats: {}, history: [] })]]);
  const p = loadProgress({ getItem: (k: string) => mem.get(k) ?? null });
  assert.equal(p.points, 0);
  assert.deepEqual(p.items, {});
  assert.equal(p.dots['m1-r'].passed, true);
});

import { ORTHO_HINTS } from '../data/orthoHints.ts';

test('każdy wyraz z ortografii ma wyjaśnienie pisowni', () => {
  for (const set of Object.values(ORTHO_SETS)) {
    for (const w of set.words) {
      const g = parseGapWord(w);
      const whole = g.before + g.answer + g.after;
      assert.ok(ORTHO_HINTS[whole], `brak wyjaśnienia dla „${whole}”`);
    }
  }
});

test('nazwy odznak nie powtarzają tytułów', () => {
  const titles = new Set(TITLES_FOR_TEST.map((t) => t.name));
  for (const b of BADGES) assert.ok(!titles.has(b.name), `odznaka „${b.name}” ma nazwę tytułu`);
});
import { TITLES as TITLES_FOR_TEST } from './points.ts';
