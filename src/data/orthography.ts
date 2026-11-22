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
      'ż[ó]łty', 'c[ó]rka', 'og[ó]rek', 'wiewi[ó]rka', 'p[ó]łka', 'kr[ó]tki', 'm[ó]wić', 'dom[ó]w', 'kresk[ó]wka', 'złot[ó]wka',
      'ł[ó]dź', 'l[ó]d', 'pi[ó]ro', 'mr[ó]z', 'n[ó]żka',
      'k[u]ra', 'b[u]rza', 'm[u]cha', 'ch[u]stka', 'kr[u]k', 'gr[u]szka', 'd[u]ży', 'kog[u]t', 'pal[u]szek', 'kwiat[u]szek',
      '[u]cho', '[u]l', '[u]czeń', 'mal[u]je', 'rys[u]nek', 'fart[u]szek', 'len[u]ch', 'b[u]t', 'k[u]chnia', 'ż[u]k',
      'sz[u]flada', 'ch[u]dy', 'dr[u]t', 'p[u]szka', 'dzi[u]rka',
    ],
  },
  'rz-z': {
    title: 'rz czy ż?',
    options: ['rz', 'ż'],
    rule: 'Rz piszemy, gdy wymienia się na r (morze → morski), po spółgłoskach b, p, d, t, g, k, ch, w, j oraz w -arz, -erz (lekarz). Ż piszemy, gdy wymienia się na g, z, s, h, dz (książka → księga).',
    words: [
      '[rz]eka', 'mo[rz]e', 'd[rz]ewo', 'ko[rz]eń', 'g[rz]yb', '[rz]epa', 'p[rz]yjaciel', 'k[rz]esło', 't[rz]y', 'p[rz]ygoda',
      'b[rz]eg', 'ch[rz]an', 'leka[rz]', 'mala[rz]', 'ryce[rz]', '[rz]ecz', 'kołnie[rz]', 'tale[rz]', 'piep[rz]', 'zwie[rz]ę',
      '[ż]aba', '[ż]ółw', 'wie[ż]a', '[ż]yrafa', 'pla[ż]a', 'ksią[ż]ka', 'no[ż]e', 'dro[ż]d[ż]e', 'mro[ż]ony', 'ło[ż]yć',
      '[ż]ółty', '[ż]uk', 'ję[ż]yk', 'stró[ż]', '[ż]ycie', 'odwa[ż]ny', 'wy[ż]szy', '[ż]elazko', '[ż]urek', '[ż]agiel',
    ],
  },
} as const;

export type OrthoSetId = keyof typeof ORTHO_SETS;
