import { PARTS, isPartCode } from '../data/partsOfSpeech.ts';
import { ORTHO_SETS, type OrthoSetId } from '../data/orthography.ts';
import { ALL_DOTS } from '../data/modules.ts';
import { dayKey, emptyProgress, streakDays, type Progress } from '../engine/storage.ts';
import { titleFor } from '../engine/points.ts';
import { BADGES, longestStreak } from '../engine/badges.ts';
import { isWeak } from '../engine/memory.ts';

type Props = { progress: Progress; onReset: (p: Progress) => void; onBack: () => void };

function label(key: string): string {
  if (isPartCode(key)) return PARTS[key].name;
  if (key in ORTHO_SETS) return ORTHO_SETS[key as OrthoSetId].title;
  return key;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <h2 className="mb-3 font-bold">{title}</h2>
      {children}
    </section>
  );
}

const pl = (n: number, one: string, few: string, many: string) =>
  n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many;

export default function Stats({ progress: p, onReset, onBack }: Props) {
  const title = titleFor(p.points);
  const streak = streakDays(p);
  const passed = ALL_DOTS.filter((d) => p.dots[d.id]?.passed).length;

  // Ostatnie 14 dni
  const days = Array.from({ length: 14 }, (_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - k));
    const key = dayKey(d);
    return { key, label: d.toLocaleDateString('pl-PL', { weekday: 'narrow' }), ...(p.days[key] ?? { answers: 0, ok: 0 }) };
  });
  const maxDay = Math.max(8, ...days.map((d) => d.answers));

  // Umiejętności (min. 1 odpowiedź), od najsłabszej
  const skills = Object.entries(p.stats)
    .filter(([k, s]) => s.total > 0 && !k.includes('+'))
    .map(([k, s]) => ({ key: k, pct: Math.round((s.ok / s.total) * 100), ...s }))
    .sort((a, b) => b.pct - a.pct);
  const strong = skills.filter((s) => s.total >= 5 && s.pct >= 80).slice(0, 3);
  const toWork = skills.filter((s) => s.total >= 5 && s.pct < 70).reverse().slice(0, 3);

  // Pomyłki w „Wyborze”
  const confusions = Object.entries(p.confusions)
    .map(([k, n]) => {
      const [right, picked] = k.split('>');
      return { right, picked, n };
    })
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);

  // Pamięć: utrwalone / w nauce / słabe
  const items = Object.values(p.items);
  const solid = items.filter((s) => s.box >= 3).length;
  const weak = items.filter(isWeak).length;
  const learning = items.length - solid - weak;

  return (
    <>
      <header className="mb-5 flex items-center gap-3">
        <button onClick={onBack} aria-label="Wróć" className="rounded-lg px-2 py-1 text-2xl text-stone-500 active:scale-90">
          ←
        </button>
        <h1 className="text-xl font-bold">Twoje postępy</h1>
      </header>

      <div className="mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 p-5 text-white shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{title.emoji}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold opacity-90">Twój tytuł</div>
            <div className="text-2xl font-bold">{title.name}</div>
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(title.progress * 100)}%` }} />
        </div>
        <div className="mt-1.5 text-sm opacity-90">
          {title.next ? `Jeszcze ${title.toNext} pkt do tytułu „${title.next.name}” ${title.next.emoji}` : 'Zdobyty najwyższy tytuł! 👑'}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { v: `⭐ ${p.points}`, l: 'punkty' },
          { v: `🔥 ${streak}`, l: `${pl(streak, 'dzień', 'dni', 'dni')} z rzędu` },
          { v: `${passed}/${ALL_DOTS.length}`, l: 'kropki' },
        ].map((t) => (
          <div key={t.l} className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-stone-200">
            <div className="text-xl font-bold">{t.v}</div>
            <div className="text-xs text-stone-500">{t.l}</div>
          </div>
        ))}
      </div>

      <Card title="Ostatnie 2 tygodnie">
        <div className="flex items-end gap-1" role="img" aria-label="Liczba odpowiedzi w ostatnich 14 dniach">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full flex-col justify-end">
                {d.answers > 0 && (
                  <div
                    className="flex w-full flex-col overflow-hidden rounded-t-md"
                    style={{ height: `${Math.max(6, Math.round((d.answers / maxDay) * 96))}px` }}
                    title={`${d.ok}/${d.answers} dobrze`}
                  >
                    <div className="bg-red-300" style={{ flexGrow: d.answers - d.ok }} />
                    <div className="bg-emerald-500" style={{ flexGrow: d.ok }} />
                  </div>
                )}
              </div>
              <span className={`text-[10px] ${d.key === dayKey(new Date()) ? 'font-bold text-rose-600' : 'text-stone-400'}`}>{d.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-500" /> dobrze
          <span className="mx-1 ml-3 inline-block h-2 w-2 rounded-sm bg-red-300" /> do poprawy · najdłuższa seria dni: {longestStreak(p)}
        </p>
      </Card>

      <Card title="Co Ci wychodzi">
        {skills.length === 0 && <p className="text-stone-500">Jeszcze nic tu nie ma. Zagraj pierwszą kropkę!</p>}
        <ul className="flex flex-col gap-3">
          {skills.map((s) => (
            <li key={s.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">{label(s.key)}</span>
                <span className="text-stone-500">
                  {s.pct}% · {s.ok}/{s.total}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
                <div className={`h-full rounded-full ${s.pct >= 80 ? 'bg-emerald-500' : s.pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${s.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
        {(strong.length > 0 || toWork.length > 0) && (
          <div className="mt-4 grid gap-2 text-sm">
            {strong.length > 0 && (
              <p className="rounded-xl bg-emerald-50 p-3 text-emerald-900">
                💪 <b>Mocne strony:</b> {strong.map((s) => label(s.key)).join(', ')}.
              </p>
            )}
            {toWork.length > 0 && (
              <p className="rounded-xl bg-amber-50 p-3 text-amber-900">
                🎯 <b>Warto poćwiczyć:</b> {toWork.map((s) => label(s.key)).join(', ')}. Zajrzyj do 📖 Wiedzy i zrób trening słabych stron.
              </p>
            )}
          </div>
        )}
      </Card>

      {confusions.length > 0 && (
        <Card title="Co najczęściej Ci się myli">
          <ul className="flex flex-col gap-2">
            {confusions.map((c) => (
              <li key={c.right + c.picked} className="flex items-center justify-between rounded-xl bg-stone-50 p-3 text-sm">
                <span>
                  <b>{label(c.right)}</b> brany za <b>{label(c.picked)}</b>
                </span>
                <span className="font-bold text-red-500">{c.n}×</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {items.length > 0 && (
        <Card title="Twoja pamięć">
          <div className="flex h-4 overflow-hidden rounded-full bg-stone-200">
            <div className="bg-emerald-500" style={{ flex: solid }} />
            <div className="bg-sky-400" style={{ flex: learning }} />
            <div className="bg-red-400" style={{ flex: weak }} />
          </div>
          <div className="mt-2 grid grid-cols-3 text-center text-sm">
            <div><b className="text-emerald-600">{solid}</b><br />utrwalone</div>
            <div><b className="text-sky-600">{learning}</b><br />w nauce</div>
            <div><b className="text-red-500">{weak}</b><br />do poprawy</div>
          </div>
          <p className="mt-2 text-xs text-stone-500">Zdania i wyrazy, które już ćwiczyłeś. Te z błędem wracają w treningu słabych stron, aż się utrwalą.</p>
        </Card>
      )}

      <Card title={`Odznaki (${BADGES.filter((b) => b.earned(p)).length}/${BADGES.length})`}>
        <ul className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => {
            const has = b.earned(p);
            return (
              <li key={b.id} title={b.how} className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center ${has ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-stone-100'}`}>
                <span className={`text-3xl ${has ? '' : 'opacity-30 grayscale'}`}>{b.emoji}</span>
                <span className={`text-xs font-semibold leading-tight ${has ? '' : 'text-stone-400'}`}>{b.name}</span>
                {!has && <span className="text-[10px] leading-tight text-stone-400">{b.how}</span>}
              </li>
            );
          })}
        </ul>
      </Card>

      <p className="mt-2 text-center text-sm text-stone-500">Wszystko jest zapisane tylko na tym urządzeniu. Nikt inny tego nie widzi.</p>
      <button
        onClick={() => {
          if (confirm('Na pewno usunąć wszystkie wyniki, punkty i odznaki z tego urządzenia?')) onReset(emptyProgress());
        }}
        className="mx-auto mb-6 mt-3 block rounded-lg px-3 py-2 text-sm text-red-600 underline"
      >
        Wyczyść wyniki
      </button>
    </>
  );
}
