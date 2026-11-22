/**
 * Bank zdań. Każdy wyraz ma po kresce kod części mowy (zob. partsOfSpeech.ts).
 * Znak interpunkcyjny to osobny token bez kodu. Zdanie sprawdza test `sentences.test.ts`.
 *
 * Zasada: tylko zdania jednoznaczne dla ucznia klas 4–6 (bez „się”, bez wyrazów,
 * które podręczniki klasyfikują różnie).
 */
export const SENTENCES: string[] = [
  'Mały|P kot|R śpi|C na|Pi miękkiej|P kanapie|R .',
  'Ola|R czyta|C ciekawą|P książkę|R .',
  'Wysokie|P drzewa|R szumią|C cicho|Pr .',
  'Trzy|L wróble|R siedzą|C na|Pi płocie|R .',
  'Tata|R szybko|Pr naprawił|C stary|P rower|R .',
  'My|Z jedziemy|C jutro|Pr nad|Pi morze|R .',
  'Pies|R głośno|Pr szczeka|C za|Pi oknem|R .',
  'Babcia|R upiekła|C pyszne|P ciasto|R z|Pi jabłkami|R .',
  'Pięć|L kolorowych|P balonów|R leży|C na|Pi stole|R .',
  'On|Z zawsze|Pr pomaga|C młodszej|P siostrze|R .',
  'Zielona|P żaba|R skacze|C po|Pi łące|R .',
  'Dzieci|R budują|C wielki|P zamek|R z|Pi piasku|R .',
  'Ona|Z pięknie|Pr śpiewa|C w|Pi chórze|R .',
  'Drugi|L pociąg|R przyjechał|C punktualnie|Pr .',
  'Kasia|R i|S Tomek|R grają|C w|Pi piłkę|R .',
  'Rano|Pr słońce|R mocno|Pr świeci|C .',
  'Ja|Z lubię|C gorącą|P czekoladę|R .',
  'Dwa|L małe|P kotki|R piją|C mleko|R .',
  'Mama|R kupiła|C świeży|P chleb|R w|Pi piekarni|R .',
  'Wiewiórka|R zbiera|C orzechy|R pod|Pi dębem|R .',
  'Oni|Z wrócili|C późno|Pr do|Pi domu|R .',
  'Pierwszy|L uczeń|R odpowiadał|C bardzo|Pr dobrze|Pr .',
  'Złoty|P liść|R powoli|Pr spada|C na|Pi ziemię|R .',
  'Wy|Z macie|C nowy|P samochód|R .',
  'Sześć|L kaczek|R pływa|C po|Pi stawie|R .',
  'Dziadek|R opowiada|C ciekawe|P historie|R przy|Pi kominku|R .',
  'Biały|P śnieg|R pokrył|C nasz|Z ogród|R .',
  'Kot|R wskoczył|C na|Pi wysoką|P szafę|R .',
  'Ptaki|R wesoło|Pr ćwierkają|C nad|Pi rzeką|R .',
  'Ten|Z chłopiec|R ma|C czerwony|P plecak|R .',
  'Cztery|L konie|R biegną|C przez|Pi pole|R .',
  'Siedem|L krasnoludków|R mieszka|C w|Pi lesie|R .',
  'Trzeci|L dzień|R pada|C deszcz|R .',
  'Ty|Z masz|C dwie|L siostry|R .',
];
