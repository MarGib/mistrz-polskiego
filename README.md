# 📚 Mistrz Polskiego

Trener gramatyki i ortografii języka polskiego dla klas 4–8. Siostrzana aplikacja [Mistrza Tabliczki](https://github.com/MarGib/Mistrz-Tabliczki---Konkursowy-trener-mno-enia-i-dzielenia): ścieżka z kropkami i gry.

Główne zadanie to **zaznaczanie słów w prawdziwym zdaniu**, a nie wkuwanie definicji.

## Zakres

- **Części mowy:** rzeczownik, czasownik, przymiotnik, liczebnik, zaimek, przyimek, przysłówek, spójnik, wykrzyknik, partykuła, imiesłów.
- **Części zdania:** podmiot, orzeczenie, przydawka, dopełnienie, okolicznik, wykres zdania.
- **Ortografia:** ó/u, rz/ż, ch/h, pisownia „nie”, wielka litera, ą/ę.

## Pierwsza wersja

Moduły 1–3 (rzeczownik, czasownik, przymiotnik → liczebnik, przysłówek → zaimek, przyimek) oraz ó/u i rz/ż. Trzy typy zadań: zaznacz w zdaniu, wybór, luka. Bank zdań w pliku.

**Wszystko działa na telefonie użytkownika:**

- bez zewnętrznej bazy danych i bez kont,
- postęp zapisany tylko w pamięci urządzenia,
- bez porównywania wyników z innymi i bez grup,
- działa offline po pierwszym otwarciu.

Funkcje społeczne (grupy, ranking, wspólne konto z Tabliczką) mogą przyjść później, ale nie w pierwszej wersji.

## Stan

🌱 Szkielet (listopad 2026): ścieżka z kropkami, zadanie „zaznacz w zdaniu” (moduły 1–3), luka ó/u i rz/ż, wyniki na urządzeniu, tryb offline.

Aplikacja: https://margib.github.io/mistrz-polskiego/ (na telefonie: „Dodaj do ekranu początkowego”).

## Uruchomienie

```bash
npm install
npm run dev      # praca nad kodem
npm run check    # typy i testy
npm run build    # wersja do publikacji
```

## Licencja

[MIT](LICENSE)
