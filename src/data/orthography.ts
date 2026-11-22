/**
 * Wyrazy do ortografii. W nawiasie kwadratowym jest poprawna litera (albo dwuznak),
 * którą uczeń wybiera spośród opcji danego zestawu, np. `g[ó]ra` w zestawie ó/u.
 */
export const ORTHO_SETS = {
  'o-u': {
    title: 'ó czy u?',
    options: ['ó', 'u'],
    rule: 'Ó piszemy, gdy wymienia się na o, e lub a (stół → stoły, sól → solić). U piszemy w końcówkach -uje, -unek, -uszek i zwykle na początku wyrazu.',
    words: [
      'g[ó]ra', 'kr[ó]l', 'st[ó]ł', 'r[ó]ża', 'ł[ó]żko', 'm[ó]j', 'ogr[ó]d', 's[ó]l', 'n[ó]ż', 'w[ó]z',
      'k[u]ra', 'b[u]rza', 'm[u]cha', 'ch[u]stka', 'kr[u]k', 'gr[u]szka', 'd[u]ży', 'kog[u]t', 'pal[u]szek', 'kwiat[u]szek',
    ],
  },
  'rz-z': {
    title: 'rz czy ż?',
    options: ['rz', 'ż'],
    rule: 'Rz piszemy, gdy wymienia się na r (morze → morski), oraz po spółgłoskach b, d, g, j, k, p, t, w, ch. Ż piszemy, gdy wymienia się na g, z, s, h, dz (książka → księga).',
    words: [
      '[rz]eka', 'mo[rz]e', 'd[rz]ewo', 'ko[rz]eń', 'g[rz]yb', '[rz]epa', 'p[rz]yjaciel', 'k[rz]esło', 't[rz]y', 'p[rz]ygoda',
      '[ż]aba', '[ż]ółw', 'wie[ż]a', '[ż]yrafa', 'pla[ż]a', 'ksią[ż]ka', 'no[ż]e', 'dro[ż]d[ż]e', 'mro[ż]ony', 'ło[ż]yć',
    ],
  },
} as const;

export type OrthoSetId = keyof typeof ORTHO_SETS;
