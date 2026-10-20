/** Opsell number, date and age formats. See the Content style guide. */
const MINUS = '−';

/** $31.6k / $1.2M in charts and KPIs (compact), $31,612 or $7,912.40 in records. Under $1,000 never compacts. */
export function money(n: number, opts: { compact?: boolean; cents?: boolean } = {}): string {
  const sign = n < 0 ? MINUS : '';
  const a = Math.abs(n);
  if (opts.compact && a >= 1000) {
    if (a >= 1e6) return `${sign}$${trim(a / 1e6, a >= 1e7 ? 0 : 1)}M`;
    return `${sign}$${trim(a / 1e3, a >= 1e5 ? 0 : 1)}k`;
  }
  return sign + '$' + a.toLocaleString('en-US', { minimumFractionDigits: opts.cents ? 2 : 0, maximumFractionDigits: opts.cents ? 2 : 0 });
}
const trim = (v: number, d: number) => (d ? v.toFixed(d).replace(/\.0$/, '') : v.toFixed(0));

/** 26.4% (one decimal). Axis ticks: pct(v, 0). */
export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

/** +6.2% / −2.1% for money and counts; +1.2 pts for percent-of metrics. Always signed, true minus. */
export function delta(n: number, unit: '%' | 'pts' | '' = '%', digits = 1): string {
  const s = n > 0 ? '+' : n < 0 ? MINUS : '±';
  return `${s}${Math.abs(n).toFixed(digits)}${unit === 'pts' ? ' pts' : unit}`;
}

/** 3,370 */
export const count = (n: number) => Math.round(n).toLocaleString('en-US');
/** 18.5 h */
export const hours = (n: number) => `${n.toFixed(1)} h`;
/** — for missing values; never 0. */
export const missing = '—';

const DAY = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
/** Fri, Oct 16 — a Business Day. Pass a date-only value (YYYY-MM-DD) to avoid time-zone shifts. */
export function businessDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return DAY.format(new Date(y, m - 1, d));
}
/** Oct 3 – Oct 16 */
export function range(fromIso: string, toIso: string): string {
  const f = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  return `${f(fromIso)} – ${f(toIso)}`;
}
/** 10:00, 09:42 — 24-hour, in the Location's time zone. */
export function time(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(d);
}
/** now · 12m · 4h · 4d · 3w · Sep 2 — how long something has been a problem. */
export function age(since: Date, now: Date = new Date()): string {
  const s = Math.max(0, (now.getTime() - since.getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 14 * 86400) return `${Math.floor(s / 86400)}d`;
  if (s < 56 * 86400) return `${Math.floor(s / (7 * 86400))}w`;
  return since.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(since.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}
