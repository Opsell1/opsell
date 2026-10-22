// Business Days and local wall-clock time in a Location's IANA time zone, without a date
// library: Intl gives the zone's offset at an instant, which is all the conversions need.

/** A Business Day ends at this local time the next morning; per-Location cutoffs come later. */
export const BUSINESS_DAY_CUTOFF_MINUTES = 4 * 60;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let format = formatters.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, format);
  }
  return format;
}

/** The wall-clock time in `timeZone` at `instant`, as milliseconds of a UTC-based calendar. */
function wallClock(instant: Date, timeZone: string): number {
  const parts: Record<string, number> = {};
  for (const part of formatter(timeZone).formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  const { year = 0, month = 1, day = 1, hour = 0, minute = 0, second = 0 } = parts;
  return Date.UTC(year, month - 1, day, hour, minute, second);
}

function isoDate(utcMillis: number): string {
  return new Date(utcMillis).toISOString().slice(0, 10);
}

/** `date` ("YYYY-MM-DD") moved by `days` calendar days. */
export function addDays(date: string, days: number): string {
  return isoDate(Date.parse(`${date}T00:00:00Z`) + days * DAY);
}

/** The day of the week of `date`, 0 for Sunday. */
export function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/**
 * The instant at which the clock in `timeZone` reads `minutes` past midnight of `date`. Minutes
 * past 24 hours run into the next calendar day. A wall time skipped by a DST change resolves to
 * the instant just after the gap.
 */
export function zonedInstant(date: string, minutes: number, timeZone: string): Date {
  const wall = Date.parse(`${date}T00:00:00Z`) + minutes * MINUTE;
  const firstOffset = wallClock(new Date(wall), timeZone) - wall;
  let instant = wall - firstOffset;
  const secondOffset = wallClock(new Date(instant), timeZone) - instant;
  if (secondOffset !== firstOffset) instant = wall - secondOffset;
  return new Date(instant);
}

/** The Business Day `instant` belongs to at a Location in `timeZone`. */
export function businessDateOf(instant: Date, timeZone: string): string {
  return isoDate(wallClock(instant, timeZone) - BUSINESS_DAY_CUTOFF_MINUTES * MINUTE);
}

/** The `count` Business Days before the one `now` falls in, oldest first. */
export function businessDatesEndingYesterday(now: Date, timeZone: string, count: number): string[] {
  const today = businessDateOf(now, timeZone);
  return Array.from({ length: count }, (_, i) => addDays(today, i - count));
}
