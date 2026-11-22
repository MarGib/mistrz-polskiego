# Mistrz Polskiego: instrukcja dla Claude Code

Trener gramatyki i ortografii dla klas 4–8 (PWA). Siostra Mistrza Tabliczki (`../mistrz-tabliczki`).
Odpowiadaj i pisz teksty w aplikacji **po polsku**, prostymi słowami (użytkownicy to dzieci i rodzice).

## Najważniejsza zasada pierwszej wersji

**Wszystko działa na urządzeniu użytkownika.** Bez zewnętrznej bazy, bez kont, bez porównywania wyników i bez grup.
Treści (bank zdań i wyrazów) są w kodzie, postęp i statystyki w `localStorage` (`mp_progress_v1`).
Nie dodawaj Firebase ani żadnych zapytań do serwerów bez wyraźnej decyzji Mariusza.

## Stos i uruchamianie

- Vite 8 + React 19 + TypeScript 7 + Tailwind 4, `base: './'`. Hosting: GitHub Pages przez Actions (push do `main` = publikacja).
- `npm run dev` (port 3001) · `npm run check` (tsc + testy `tsx --test`) · `npm run build` · `npm run preview` (port 4174).
- Tryb offline: `node tools/offline-check.mjs` (po `build` i przy włączonym `preview`; lokalnie używa Chrome).
- Przed pushem zawsze `npm run check` i `npm run build`.

## Mapa kodu

| Obszar | Pliki |
|---|---|
| Części mowy (kody R, C, P, L, Pr, Z, Pi, S) | `src/data/partsOfSpeech.ts` |
| Bank zdań (`kot|R`) | `src/data/sentences.ts` |
| Ortografia (`g[ó]ra`) | `src/data/orthography.ts` |
| Moduły i kropki | `src/data/modules.ts` |
| Silnik: parser, serie, sprawdzanie, ścieżka | `src/engine/parse.ts`, `series.ts`, `path.ts` |
| Zapis postępu na urządzeniu | `src/engine/storage.ts` |
| Ekrany | `src/components/Home.tsx`, `Exercise.tsx`, `Stats.tsx` |
| Offline (PWA) | `public/sw.js`, `public/manifest.webmanifest`, `precache.json` z `vite.config.ts` |

## Treści

- Każde zdanie musi być jednoznaczne dla ucznia klas 4–6. Unikamy „się” i wyrazów, które podręczniki klasyfikują różnie.
- Test `src/engine/engine.test.ts` pilnuje, że każdy wyraz ma kod i że każda kropka ma pełną serię (8 zadań).
- Nowe treści robione z AI przegląda człowiek, zanim trafią do aplikacji.

## Zasady pracy

- Commit po każdym kroku, wiadomości po polsku: `feat:`, `fix:`, `chore:`.
- Żadnych sekretów i danych osobowych dzieci w repo (repo jest **publiczne**).
- Dokumentacja projektu (plan, decyzje, dziennik) jest w Obsidianie: `10 Projekty/Mistrz Polskiego/`.
