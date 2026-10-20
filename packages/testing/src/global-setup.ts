// Vitest globalSetup: one migrated template database per test run (ADR 0009). Each Vitest
// worker clones it on first use (see testDatabase), and the run drops its databases at the end.
import {
  bootstrap,
  createEmptyDatabase,
  dropDatabases,
  listDatabases,
  migrate,
  withDatabase,
} from "@opsell/db/admin";
import type { TestProject } from "vitest/node";
import "./database.ts";
import { ownerRole, testEnv } from "./env.ts";

export const TEST_DATABASE_PREFIX = "opsell_t_";
const STALE_AFTER_SECONDS = 3600;

export default async function setup(project: TestProject) {
  await bootstrap(testEnv.adminUrl, testEnv);
  await dropStaleDatabases();

  const startedAt = Math.floor(Date.now() / 1000);
  const template = `${TEST_DATABASE_PREFIX}${startedAt}_${Math.random().toString(36).slice(2, 8)}`;
  await createEmptyDatabase(testEnv.adminUrl, template, ownerRole());
  await migrate(withDatabase(testEnv.ownerUrl, template));
  project.provide("opsellTemplateDatabase", template);

  return async () => {
    await dropDatabases(testEnv.adminUrl, await listDatabases(testEnv.adminUrl, template));
  };
}

/** Drops databases left by runs that were killed before their teardown, judged by age. */
async function dropStaleDatabases(): Promise<void> {
  const cutoff = Date.now() / 1000 - STALE_AFTER_SECONDS;
  const stale = (await listDatabases(testEnv.adminUrl, TEST_DATABASE_PREFIX)).filter((name) => {
    const startedAt = Number(name.slice(TEST_DATABASE_PREFIX.length).split("_")[0]);
    return Number.isFinite(startedAt) && startedAt < cutoff;
  });
  await dropDatabases(testEnv.adminUrl, stale);
}
