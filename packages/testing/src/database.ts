import { cloneDatabase, withDatabase } from "@opsell/db/admin";
import { inject } from "vitest";
import { ownerRole, testEnv } from "./env.ts";

declare module "vitest" {
  export interface ProvidedContext {
    /** The run's migrated template database, provided by global-setup.ts. */
    opsellTemplateDatabase: string;
  }
}

export interface TestDatabase {
  name: string;
  /** Connects as the API role, so Row-Level Security applies. */
  apiUrl: string;
  workerUrl: string;
  /** Connects as the table owner, which bypasses Row-Level Security; for scenario setup only. */
  ownerUrl: string;
}

/**
 * This Vitest worker's clone of the run's migrated template. Tests share it and never truncate
 * or roll back: each builds its own Organizations, and Row-Level Security keeps them apart.
 */
export async function testDatabase(): Promise<TestDatabase> {
  const template = inject("opsellTemplateDatabase");
  const name = `${template}_w${process.env.VITEST_POOL_ID ?? "0"}`;
  await cloneDatabase(testEnv.adminUrl, template, name, ownerRole());
  return {
    name,
    apiUrl: withDatabase(testEnv.apiUrl, name),
    workerUrl: withDatabase(testEnv.workerUrl, name),
    ownerUrl: withDatabase(testEnv.ownerUrl, name),
  };
}
