// The data source ports, split by data type (spec #66): sales/orders, time entries, tip entries
// and roster. Every source adapter returns these canonical entries; the mock data source is the
// only one in the MVP, and Toast and Harri implement the same ports later. Entries carry the
// source's own external IDs and modified time; Opsell maps them onto its records when it syncs.

export type SourceKind = "mock";

/** A store as the source knows it; a Location is imported from one. */
export interface SourceStore {
  externalId: string;
  name: string;
  city: string;
  state: string;
  timeZone: string;
}

/** A job as the source knows it; a Position is imported from one. */
export interface SourceJob {
  externalId: string;
  name: string;
  house: "front" | "back";
}

/** A roster entry; an Employee is imported from one. */
export interface SourcePerson {
  externalId: string;
  firstName: string;
  lastName: string;
  /** The stores the person works at. */
  storeExternalIds: string[];
  jobExternalIds: string[];
  modifiedAt: Date;
}

export interface SourceSalesOrder {
  externalId: string;
  storeExternalId: string;
  /** The Business Day of the order's fulfillment. */
  businessDate: string;
  /** The point of sale's own order type, mapped onto a Sales Channel later. */
  orderType: string;
  /** The delivery app or other partner the order came through, if any. */
  channelPartner: string | null;
  fulfillment: "counter" | "pickup" | "delivery";
  orderedAt: Date;
  promisedAt: Date | null;
  fulfilledAt: Date;
  grossCents: number;
  discountCents: number;
  netCents: number;
  taxCents: number;
  serviceChargeCents: number;
  refundCents: number;
  paymentMethod: "card" | "cash";
  modifiedAt: Date;
}

export interface SourceTimeEntry {
  externalId: string;
  storeExternalId: string;
  personExternalId: string;
  jobExternalId: string;
  businessDate: string;
  clockInAt: Date;
  clockOutAt: Date;
  /** Only approved entries prefill Tip Distribution lines. */
  approval: "approved" | "pending";
  modifiedAt: Date;
}

/**
 * A tip as its owning system records it: the POS owns card tips, cash tips recorded on payments
 * and auto-gratuities; the time clock owns tips an Employee declares as received in cash.
 */
export interface SourceTipEntry {
  externalId: string;
  storeExternalId: string;
  businessDate: string;
  kind: "card" | "cash_on_payment" | "auto_gratuity" | "declared_cash";
  /** Who the tip is for: the Location's staff, or a delivery courier. */
  owner: "location_staff" | "courier";
  amountCents: number;
  orderExternalId: string | null;
  personExternalId: string | null;
  occurredAt: Date;
  modifiedAt: Date;
}

export interface RosterPort {
  jobs(): Promise<SourceJob[]>;
  people(): Promise<SourcePerson[]>;
}

export interface SalesPort {
  salesOrders(storeExternalId: string, businessDate: string): Promise<SourceSalesOrder[]>;
}

export interface TimeEntriesPort {
  timeEntries(storeExternalId: string, businessDate: string): Promise<SourceTimeEntry[]>;
}

export interface TipEntriesPort {
  tipEntries(storeExternalId: string, businessDate: string): Promise<SourceTipEntry[]>;
}

/** One source serving every data type. Each Location reads each data type from exactly one. */
export interface DataSource {
  kind: SourceKind;
  stores(): Promise<SourceStore[]>;
  roster: RosterPort;
  sales: SalesPort;
  timeEntries: TimeEntriesPort;
  tipEntries: TipEntriesPort;
}
