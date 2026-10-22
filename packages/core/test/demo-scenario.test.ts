import { describe, expect, it } from "vitest";
import {
  businessDatesEndingYesterday,
  type DemoScenarioSpec,
  demoScenario,
  SMALL_BAKERY_CAFE,
} from "../src/index.ts";

/** One MA Location and two Positions: the kind of small scenario a contract test builds. */
const TINY: DemoScenarioSpec = {
  hours: { opens: "06:30", closes: "15:00" },
  stores: [
    {
      key: "elm",
      name: "Elm St",
      city: "Somerville",
      state: "MA",
      timeZone: "America/New_York",
      taxRate: 0.0625,
      ordersPerDay: 12,
      staffing: { Cashier: 2, Baker: 1 },
    },
  ],
  jobs: [
    { name: "Cashier", house: "front", shifts: ["06:15-11:30", "10:30-15:15"] },
    { name: "Baker", house: "back", shifts: ["04:30-12:30"] },
  ],
  sharedPeople: 0,
};

describe("demoScenario", () => {
  it("builds the same roster and Business Days from the same seed", () => {
    const first = demoScenario({ seed: 42, spec: SMALL_BAKERY_CAFE });
    const second = demoScenario({ seed: 42, spec: SMALL_BAKERY_CAFE });

    expect(second.stores).toEqual(first.stores);
    expect(second.jobs).toEqual(first.jobs);
    expect(second.people).toEqual(first.people);
    for (const store of first.stores) {
      expect(second.day(store.externalId, "2026-10-17")).toEqual(
        first.day(store.externalId, "2026-10-17"),
      );
    }
  });

  it("builds different people and sales from a different seed", () => {
    const a = demoScenario({ seed: 1, spec: SMALL_BAKERY_CAFE });
    const b = demoScenario({ seed: 2, spec: SMALL_BAKERY_CAFE });
    const [store] = a.stores;
    if (!store) throw new Error("scenario has no store");

    expect(b.people.map((p) => p.lastName)).not.toEqual(a.people.map((p) => p.lastName));
    expect(b.day(store.externalId, "2026-10-17").salesOrders).not.toEqual(
      a.day(store.externalId, "2026-10-17").salesOrders,
    );
  });

  it("staffs each store's Positions as the spec says and gives everyone a works-at store", () => {
    const scenario = demoScenario({ seed: 7, spec: TINY });

    expect(scenario.stores.map((s) => s.name)).toEqual(["Elm St"]);
    expect(scenario.jobs.map((j) => [j.name, j.house])).toEqual([
      ["Cashier", "front"],
      ["Baker", "back"],
    ]);
    expect(scenario.people).toHaveLength(3);
    expect(scenario.people.map((p) => p.jobExternalIds)).toEqual(
      expect.arrayContaining([[expect.any(String)]]),
    );
    for (const person of scenario.people) {
      expect(person.storeExternalIds).toEqual([scenario.stores[0]?.externalId]);
    }
  });

  it("gives a Business Day sales, approved time entries for its own people, and tips", () => {
    const scenario = demoScenario({ seed: 7, spec: TINY });
    const [store] = scenario.stores;
    if (!store) throw new Error("scenario has no store");

    const day = scenario.day(store.externalId, "2026-10-17");

    expect(day.salesOrders.length).toBeGreaterThan(0);
    for (const order of day.salesOrders) {
      expect(order.businessDate).toBe("2026-10-17");
      expect(order.netCents).toBe(order.grossCents - order.discountCents);
      expect(order.fulfilledAt.getTime()).toBeGreaterThanOrEqual(order.orderedAt.getTime());
    }
    const people = new Set(scenario.people.map((p) => p.externalId));
    expect(day.timeEntries.length).toBeGreaterThan(0);
    for (const entry of day.timeEntries) {
      expect(people.has(entry.personExternalId)).toBe(true);
      expect(entry.approval).toBe("approved");
      expect(entry.clockOutAt.getTime()).toBeGreaterThan(entry.clockInAt.getTime());
    }
    expect(day.tipEntries.length).toBeGreaterThan(0);
    for (const tip of day.tipEntries) expect(tip.amountCents).toBeGreaterThan(0);
  });

  it("keeps a Business Day's activity between its opening and the next day's cutoff", () => {
    const scenario = demoScenario({ seed: 3, spec: TINY });
    const [store] = scenario.stores;
    if (!store) throw new Error("scenario has no store");

    const day = scenario.day(store.externalId, "2026-10-17");

    // 2026-10-17 in Somerville runs from 04:00 EDT (08:00Z) to 04:00 EDT the next morning.
    const opens = Date.parse("2026-10-17T08:00:00Z");
    const closes = Date.parse("2026-10-18T08:00:00Z");
    const instants = [
      ...day.salesOrders.flatMap((o) => [o.orderedAt, o.fulfilledAt]),
      ...day.timeEntries.flatMap((e) => [e.clockInAt, e.clockOutAt]),
    ].map((d) => d.getTime());
    expect(Math.min(...instants)).toBeGreaterThanOrEqual(opens);
    expect(Math.max(...instants)).toBeLessThan(closes);
  });
});

describe("businessDatesEndingYesterday", () => {
  it("lists the Business Days before today's, oldest first", () => {
    // 08:00 in Los Angeles on the 20th: today's Business Day is the 20th.
    expect(
      businessDatesEndingYesterday(new Date("2026-10-20T15:00:00Z"), "America/Los_Angeles", 3),
    ).toEqual(["2026-10-17", "2026-10-18", "2026-10-19"]);
  });

  it("counts the small hours as the previous Business Day, until the 04:00 cutoff", () => {
    // 03:00 in Los Angeles on the 20th still belongs to the 19th's Business Day.
    expect(
      businessDatesEndingYesterday(new Date("2026-10-20T10:00:00Z"), "America/Los_Angeles", 2),
    ).toEqual(["2026-10-17", "2026-10-18"]);
  });
});
