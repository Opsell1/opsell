// The deterministic demo generator (spec #66, ADR 0005): a fixed seed plus a scenario spec
// always produce the same roster, and the same sales, time entries and tips for any Business
// Day. Each Business Day draws from its own seeded stream, so a day's data does not depend on
// when it is generated: a Demo Organization created tomorrow shares every day but one with one
// created today. The mock data source serves this output, and tests build small scenarios with it.
import { BUSINESS_DAY_CUTOFF_MINUTES, weekday, zonedInstant } from "../business-day.ts";
import type {
  SourceJob,
  SourcePerson,
  SourceSalesOrder,
  SourceStore,
  SourceTimeEntry,
  SourceTipEntry,
} from "../sources/ports.ts";
import { createRandom, type Random } from "./random.ts";

export interface DemoJobSpec {
  name: string;
  house: "front" | "back";
  /** Local shift windows such as "06:00-11:30"; the people on shift that day take them in turn. */
  shifts: string[];
}

export interface DemoStoreSpec {
  /** Short, stable key; external IDs are built from it. */
  key: string;
  name: string;
  city: string;
  state: string;
  timeZone: string;
  /** Sales tax on net sales, for example 0.0625. */
  taxRate: number;
  /** Orders on an ordinary weekday; weekends are busier. */
  ordersPerDay: number;
  /** Headcount per job name; about 60% of each job's people work any given day. */
  staffing: Record<string, number>;
}

export interface DemoScenarioSpec {
  /** Local opening hours of every store, "HH:MM". */
  hours: { opens: string; closes: string };
  stores: DemoStoreSpec[];
  jobs: DemoJobSpec[];
  /** People who work at the first two stores, in the first front-of-house job. */
  sharedPeople: number;
}

export interface DemoDay {
  salesOrders: SourceSalesOrder[];
  timeEntries: SourceTimeEntry[];
  tipEntries: SourceTipEntry[];
}

export interface DemoScenario {
  seed: number;
  stores: SourceStore[];
  jobs: SourceJob[];
  people: SourcePerson[];
  /** One store's sales, time entries and tips for one Business Day ("YYYY-MM-DD"). */
  day(storeExternalId: string, businessDate: string): DemoDay;
}

/** The small bakery-cafe chain a Platform Staff console creates: two Locations, 19 people. */
export const SMALL_BAKERY_CAFE: DemoScenarioSpec = {
  hours: { opens: "06:30", closes: "15:00" },
  stores: [
    {
      key: "harbor",
      name: "Harbor St",
      city: "San Diego",
      state: "CA",
      timeZone: "America/Los_Angeles",
      taxRate: 0.0775,
      ordersPerDay: 70,
      staffing: { Cashier: 3, Barista: 2, Baker: 2, Dishwasher: 1 },
    },
    {
      key: "elm",
      name: "Elm St",
      city: "Somerville",
      state: "MA",
      timeZone: "America/New_York",
      taxRate: 0.0625,
      ordersPerDay: 55,
      staffing: { Cashier: 3, Barista: 2, Baker: 2, Dishwasher: 1 },
    },
  ],
  jobs: [
    { name: "Cashier", house: "front", shifts: ["06:15-11:30", "10:30-15:15"] },
    { name: "Barista", house: "front", shifts: ["06:00-12:00", "09:30-15:15"] },
    { name: "Baker", house: "back", shifts: ["04:30-12:30"] },
    { name: "Dishwasher", house: "back", shifts: ["08:00-15:30"] },
  ],
  sharedPeople: 3,
};

// 48 and 47 are coprime, so pairing the i-th of each shuffled list never repeats a full name
// below 48 x 47 people.
const FIRST_NAMES = [
  "Ava",
  "Ben",
  "Carmen",
  "Dev",
  "Elena",
  "Felix",
  "Grace",
  "Hector",
  "Imani",
  "Jonah",
  "Keiko",
  "Luis",
  "Maya",
  "Nate",
  "Olivia",
  "Priya",
  "Quinn",
  "Rosa",
  "Sam",
  "Tariq",
  "Uma",
  "Victor",
  "Wren",
  "Xavier",
  "Yara",
  "Zane",
  "Alma",
  "Bo",
  "Chloe",
  "Diego",
  "Esme",
  "Farah",
  "Gus",
  "Hana",
  "Isaac",
  "Jade",
  "Kofi",
  "Lena",
  "Marco",
  "Nia",
  "Omar",
  "Pia",
  "Rafael",
  "Sofia",
  "Theo",
  "Vera",
  "Will",
  "Zoe",
] as const;
const LAST_NAMES = [
  "Alvarez",
  "Bennett",
  "Chen",
  "Diaz",
  "Edwards",
  "Fischer",
  "Garcia",
  "Haddad",
  "Ito",
  "Johnson",
  "Kim",
  "Lopez",
  "Mendes",
  "Nguyen",
  "Okafor",
  "Patel",
  "Quintero",
  "Reyes",
  "Silva",
  "Thompson",
  "Ueda",
  "Vargas",
  "Walsh",
  "Xu",
  "Young",
  "Zimmer",
  "Abbott",
  "Brooks",
  "Castillo",
  "Doyle",
  "Ellis",
  "Flores",
  "Grant",
  "Hughes",
  "Iqbal",
  "Jensen",
  "Kowalski",
  "Larsen",
  "Murphy",
  "Novak",
  "Ortiz",
  "Park",
  "Rossi",
  "Shah",
  "Torres",
  "Vance",
  "Wu",
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
/** Weekends are busier at a bakery-cafe; Sunday is 0. */
const WEEKDAY_TRAFFIC = [1.25, 0.9, 0.95, 1, 1, 1.1, 1.35] as const;

const ORDER_TYPES = {
  Counter: 70,
  "Online pickup": 15,
  DoorDash: 6,
  "Uber Eats": 4,
  Catering: 5,
} as const;
type OrderType = keyof typeof ORDER_TYPES;

function minutesOf(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

export function demoScenario({
  seed,
  spec,
}: {
  seed: number;
  spec: DemoScenarioSpec;
}): DemoScenario {
  const stores: SourceStore[] = spec.stores.map((s) => ({
    externalId: `mock-store-${s.key}`,
    name: s.name,
    city: s.city,
    state: s.state,
    timeZone: s.timeZone,
  }));
  const jobs: SourceJob[] = spec.jobs.map((j) => ({
    externalId: `mock-job-${slug(j.name)}`,
    name: j.name,
    house: j.house,
  }));
  const jobIdByName = new Map(jobs.map((j) => [j.name, j.externalId]));
  const people = buildPeople(seed, spec, stores, jobIdByName);
  const storeSpecs = new Map(spec.stores.map((s, i) => [stores[i]?.externalId, s]));

  return {
    seed,
    stores,
    jobs,
    people,
    day(storeExternalId, businessDate) {
      const store = storeSpecs.get(storeExternalId);
      if (!store) throw new Error(`No store ${storeExternalId} in this scenario`);
      const context: DayContext = { seed, spec, store, storeExternalId, businessDate };
      const sales = buildSales(context);
      const shifts = buildShifts(context, people, jobIdByName);
      return {
        salesOrders: sales.orders,
        timeEntries: shifts.entries,
        tipEntries: [...sales.tips, ...shifts.tips],
      };
    },
  };
}

function buildPeople(
  seed: number,
  spec: DemoScenarioSpec,
  stores: SourceStore[],
  jobIdByName: Map<string, string>,
): SourcePerson[] {
  const random = createRandom(`${seed}|roster`);
  const firstNames = random.shuffle(FIRST_NAMES);
  const lastNames = random.shuffle(LAST_NAMES);
  const people: SourcePerson[] = [];
  const add = (storeExternalIds: string[], jobName: string) => {
    const i = people.length;
    const jobExternalId = jobIdByName.get(jobName);
    if (!jobExternalId) throw new Error(`Staffing names unknown job ${jobName}`);
    people.push({
      externalId: `mock-person-${pad(i + 1)}`,
      firstName: firstNames[i % firstNames.length] ?? "Alex",
      lastName: lastNames[i % lastNames.length] ?? "Doe",
      storeExternalIds,
      jobExternalIds: [jobExternalId],
      // Roster entries are stamped with a fixed time so they depend on the seed alone.
      modifiedAt: new Date("2026-01-01T00:00:00Z"),
    });
  };

  spec.stores.forEach((store, s) => {
    const storeExternalId = stores[s]?.externalId;
    if (!storeExternalId) return;
    for (const [jobName, headcount] of Object.entries(store.staffing)) {
      for (let n = 0; n < headcount; n++) add([storeExternalId], jobName);
    }
  });

  const [first, second] = stores;
  const sharedJob = spec.jobs.find((j) => j.house === "front");
  if (first && second && sharedJob) {
    for (let n = 0; n < spec.sharedPeople; n++) {
      add([first.externalId, second.externalId], sharedJob.name);
    }
  }
  return people;
}

interface DayContext {
  seed: number;
  spec: DemoScenarioSpec;
  store: DemoStoreSpec;
  storeExternalId: string;
  businessDate: string;
}

function dayKey({ seed, store, businessDate }: DayContext, stream: string): string {
  return `${seed}|${store.key}|${businessDate}|${stream}`;
}

function buildSales(context: DayContext): { orders: SourceSalesOrder[]; tips: SourceTipEntry[] } {
  const { spec, store, storeExternalId, businessDate } = context;
  const random = createRandom(dayKey(context, "sales"));
  const at = (minutes: number) => zonedInstant(businessDate, minutes, store.timeZone);
  const opens = minutesOf(spec.hours.opens);
  const closes = minutesOf(spec.hours.closes);
  const traffic = WEEKDAY_TRAFFIC[weekday(businessDate)] ?? 1;
  const count = Math.max(1, Math.round(store.ordersPerDay * traffic * (0.9 + 0.2 * random.next())));
  const orderPrefix = `mock-order-${store.key}-${businessDate.replaceAll("-", "")}`;

  const orders: SourceSalesOrder[] = [];
  const tips: SourceTipEntry[] = [];
  for (let n = 1; n <= count; n++) {
    const orderType = random.weighted(ORDER_TYPES);
    const externalId = `${orderPrefix}-${pad(n)}`;
    const times = orderTimes(random, orderType, opens, closes);
    const grossCents = orderGross(random, orderType);
    const discountCents = random.chance(0.06) ? Math.round(grossCents * 0.1) : 0;
    const netCents = grossCents - discountCents;
    const taxCents = Math.round(netCents * store.taxRate);
    const serviceChargeCents = orderType === "Catering" && random.chance(0.5) ? 2500 : 0;
    const refundCents = random.chance(0.01) ? netCents + taxCents : 0;
    const paymentMethod = orderType === "Counter" && random.chance(0.2) ? "cash" : "card";
    const fulfilledAt = at(times.fulfilled);

    orders.push({
      externalId,
      storeExternalId,
      businessDate,
      orderType,
      channelPartner: orderType === "DoorDash" || orderType === "Uber Eats" ? orderType : null,
      fulfillment:
        orderType === "Counter" ? "counter" : orderType === "Online pickup" ? "pickup" : "delivery",
      orderedAt: at(times.ordered),
      promisedAt: times.promised === null ? null : at(times.promised),
      fulfilledAt,
      grossCents,
      discountCents,
      netCents,
      taxCents,
      serviceChargeCents,
      refundCents,
      paymentMethod,
      modifiedAt: fulfilledAt,
    });

    const tip = orderTip(random, orderType, paymentMethod, netCents);
    if (tip) {
      tips.push({
        externalId: `${externalId}-tip`,
        storeExternalId,
        businessDate,
        ...tip,
        orderExternalId: externalId,
        personExternalId: null,
        occurredAt: fulfilledAt,
        modifiedAt: fulfilledAt,
      });
    }
  }
  orders.sort((a, b) => a.orderedAt.getTime() - b.orderedAt.getTime());
  return { orders, tips };
}

function orderTimes(
  random: Random,
  orderType: OrderType,
  opens: number,
  closes: number,
): { ordered: number; promised: number | null; fulfilled: number } {
  if (orderType === "Catering") {
    // Catering is ordered ahead and goes out in the morning.
    const fulfilled = random.int(opens + 60, opens + 240);
    return { ordered: random.int(opens, fulfilled - 45), promised: fulfilled, fulfilled };
  }
  // Steady trade with a lunch peak around noon.
  const ordered = random.chance(0.4)
    ? Math.min(closes - 20, Math.max(opens, 720 + random.int(-60, 60) + random.int(-30, 30)))
    : random.int(opens, closes - 20);
  if (orderType === "Counter") {
    return { ordered, promised: null, fulfilled: ordered + random.int(2, 8) };
  }
  const promised = ordered + random.int(12, 20);
  return { ordered, promised, fulfilled: promised + random.int(-4, 6) };
}

function orderGross(random: Random, orderType: OrderType): number {
  switch (orderType) {
    case "Counter":
      return random.int(450, 3200);
    case "Online pickup":
      return random.int(1200, 4500);
    case "DoorDash":
    case "Uber Eats":
      return random.int(1500, 5200);
    case "Catering":
      return random.int(9000, 38000);
  }
}

function orderTip(
  random: Random,
  orderType: OrderType,
  paymentMethod: "card" | "cash",
  netCents: number,
): Pick<SourceTipEntry, "kind" | "owner" | "amountCents"> | null {
  const percent = (low: number, high: number) =>
    Math.max(25, Math.round((netCents * random.int(low, high)) / 100));
  switch (orderType) {
    case "Counter":
      if (paymentMethod === "cash") {
        return random.chance(0.3)
          ? {
              kind: "cash_on_payment",
              owner: "location_staff",
              amountCents: random.int(1, 5) * 100,
            }
          : null;
      }
      return random.chance(0.55)
        ? { kind: "card", owner: "location_staff", amountCents: percent(10, 20) }
        : null;
    case "Online pickup":
      return random.chance(0.4)
        ? { kind: "card", owner: "location_staff", amountCents: percent(10, 15) }
        : null;
    case "DoorDash":
    case "Uber Eats":
      // The courier's tip passes through the order but never reaches the Tip Pool.
      return random.chance(0.8)
        ? { kind: "card", owner: "courier", amountCents: percent(10, 20) }
        : null;
    case "Catering":
      return { kind: "auto_gratuity", owner: "location_staff", amountCents: percent(15, 15) };
  }
}

function buildShifts(
  context: DayContext,
  people: SourcePerson[],
  jobIdByName: Map<string, string>,
): { entries: SourceTimeEntry[]; tips: SourceTipEntry[] } {
  const { spec, store, storeExternalId, businessDate } = context;
  const random = createRandom(dayKey(context, "shifts"));
  const at = (minutes: number) => zonedInstant(businessDate, minutes, store.timeZone);
  const timePrefix = `mock-time-${store.key}-${businessDate.replaceAll("-", "")}`;
  const dayNumber = Math.floor(Date.parse(`${businessDate}T00:00:00Z`) / DAY_MS);
  // Someone who works at several stores works at one of them each day, never two at once.
  const worksHereToday = (person: SourcePerson) =>
    person.storeExternalIds[dayNumber % person.storeExternalIds.length] === storeExternalId;

  const entries: SourceTimeEntry[] = [];
  const tips: SourceTipEntry[] = [];
  for (const job of spec.jobs) {
    const jobExternalId = jobIdByName.get(job.name);
    const headcount = store.staffing[job.name] ?? 0;
    if (!jobExternalId || headcount === 0) continue;
    const onShift = random
      .shuffle(
        people.filter(
          (p) =>
            p.storeExternalIds.includes(storeExternalId) &&
            p.jobExternalIds.includes(jobExternalId) &&
            worksHereToday(p),
        ),
      )
      .slice(0, Math.max(1, Math.round(headcount * 0.6)));

    onShift.forEach((person, i) => {
      const window = job.shifts[i % job.shifts.length] ?? "09:00-15:00";
      const [start = "09:00", end = "15:00"] = window.split("-");
      // Clock-ins can run early, never past the previous Business Day's cutoff.
      const clockIn = Math.max(BUSINESS_DAY_CUTOFF_MINUTES, minutesOf(start) + random.int(-8, 6));
      const clockOut = minutesOf(end) + random.int(-5, 12);
      const clockOutAt = at(clockOut);
      const externalId = `${timePrefix}-${pad(entries.length + 1)}`;
      entries.push({
        externalId,
        storeExternalId,
        personExternalId: person.externalId,
        jobExternalId,
        businessDate,
        clockInAt: at(clockIn),
        clockOutAt,
        approval: "approved",
        modifiedAt: clockOutAt,
      });
      if (job.house === "front" && random.chance(0.5)) {
        tips.push({
          externalId: `${externalId}-declared`,
          storeExternalId,
          businessDate,
          kind: "declared_cash",
          owner: "location_staff",
          amountCents: random.int(3, 25) * 100,
          orderExternalId: null,
          personExternalId: person.externalId,
          occurredAt: clockOutAt,
          modifiedAt: clockOutAt,
        });
      }
    });
  }
  return { entries, tips };
}
