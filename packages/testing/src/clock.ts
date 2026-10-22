import type { Clock } from "@opsell/core";

/** A Clock that only moves when a test moves it. */
export class FakeClock implements Clock {
  #now: number;

  constructor(start: Date | string = "2026-10-20T15:00:00.000Z") {
    this.#now = new Date(start).getTime();
  }

  now(): Date {
    return new Date(this.#now);
  }

  set(to: Date | string): void {
    this.#now = new Date(to).getTime();
  }

  advance(by: { days?: number; hours?: number; minutes?: number; seconds?: number }): void {
    const { days = 0, hours = 0, minutes = 0, seconds = 0 } = by;
    this.#now += (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;
  }
}
