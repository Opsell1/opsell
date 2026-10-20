import type { Clock, LocationRecord, Role } from "@opsell/core";
import * as schema from "@opsell/db";
import { locations, memberships, organizations, type Schema, users } from "@opsell/db";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";

export interface UserFixture {
  id: string;
  name: string;
  email: string;
}

export interface OrganizationFixture {
  id: string;
  name: string;
  isDemo: boolean;
  /** Every scenario Organization has an Org Admin to sign in as. */
  admin: UserFixture;
  locations: LocationRecord[];
}

export interface LocationInput {
  name?: string;
  city?: string;
  state?: string;
  timeZone?: string;
}

export interface OrganizationInput {
  name?: string;
  isDemo?: boolean;
  /** How many Locations to create, or their details. */
  locations?: number | LocationInput[];
}

/**
 * Builds each test's own Organizations, Users and Locations (ADR 0009). It writes as the table
 * owner, which bypasses Row-Level Security, so tests can set up any tenant; the code under test
 * always connects as the API or worker role.
 */
export class Scenario {
  readonly #pool: pg.Pool;
  readonly #db: NodePgDatabase<Schema>;
  readonly #clock: Clock;

  constructor(ownerUrl: string, clock: Clock) {
    this.#pool = new pg.Pool({ connectionString: ownerUrl, max: 2 });
    this.#db = drizzle({ client: this.#pool, schema });
    this.#clock = clock;
  }

  async organization(input: OrganizationInput = {}): Promise<OrganizationFixture> {
    const tag = shortId();
    const now = this.#clock.now();
    const [org] = await this.#db
      .insert(organizations)
      .values({
        name: input.name ?? `Organization ${tag}`,
        isDemo: input.isDemo ?? false,
        createdAt: now,
      })
      .returning();
    if (!org) throw new Error("Organization was not created");

    const admin = await this.user({ name: `Org Admin ${tag}` });
    await this.membership(org.id, admin.id, "org_admin");

    const wanted: LocationInput[] =
      typeof input.locations === "number"
        ? Array.from({ length: input.locations }, () => ({}))
        : (input.locations ?? []);
    const created = wanted.length
      ? await this.#db
          .insert(locations)
          .values(
            wanted.map((l, i) => ({
              organizationId: org.id,
              name: l.name ?? `Location ${tag}-${i + 1}`,
              city: l.city ?? "Springfield",
              state: l.state ?? "IL",
              timeZone: l.timeZone ?? "America/Chicago",
              createdAt: now,
            })),
          )
          .returning()
      : [];

    return { id: org.id, name: org.name, isDemo: org.isDemo, admin, locations: created };
  }

  async user(input: { name?: string; email?: string } = {}): Promise<UserFixture> {
    const tag = shortId();
    const now = this.#clock.now();
    const [user] = await this.#db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: input.name ?? `User ${tag}`,
        email: input.email ?? `user-${tag}@scenario.example`,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: users.id, name: users.name, email: users.email });
    if (!user) throw new Error("User was not created");
    return user;
  }

  async membership(organizationId: string, userId: string, role: Role): Promise<void> {
    await this.#db
      .insert(memberships)
      .values({ organizationId, userId, role, createdAt: this.#clock.now() });
  }

  close(): Promise<void> {
    return this.#pool.end();
  }
}

function shortId(): string {
  return crypto.randomUUID().slice(0, 8);
}
