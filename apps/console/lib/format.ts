// Console number and date formats, following the design system's content style (Opsell's own
// format.ts is not exported yet; see packages/ui/src/DESIGN-EXPORT.md).

/** $7,912 from cents, whole dollars. */
export function dollars(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

/** 3,370 */
export const count = (n: number) => Math.round(n).toLocaleString("en-US");

/** 1,204.5 h from minutes. */
export function hours(minutes: number): string {
  return `${(minutes / 60).toLocaleString("en-US", { maximumFractionDigits: 1 })} h`;
}

/** Oct 13 – Oct 19, for a range of Business Days ("YYYY-MM-DD"). */
export function dateRange(first: string, last: string): string {
  const day = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return `${day(first)} – ${day(last)}`;
}

/** How many Business Days run from `first` to `last`, both included. */
export function dayCount(first: string, last: string): number {
  return (Date.parse(`${last}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86_400_000 + 1;
}

/** Oct 20, 2026, 15:00 UTC: when a console action happened, the same for every reader. */
export function timestamp(iso: string): string {
  return `${new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  })} UTC`;
}
