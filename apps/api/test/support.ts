import type { AddressInfo } from "node:net";
import { createApiClient } from "@opsell/contract";
import type { Deps } from "@opsell/core";
import { createDatabase } from "@opsell/db";
import {
  createTestJobs,
  FakeClaude,
  FakeClock,
  Outbox,
  Scenario,
  signIn,
  startTestBoss,
  testDatabase,
  type UserFixture,
} from "@opsell/testing";
import { afterAll } from "vitest";
import { createApp } from "../src/index.ts";

const WEB_ORIGIN = "http://web.test";

/**
 * Starts the real Express app in-process on a free port, wired to this worker's test database
 * as the API role and to fakes for time, mail, SMS and Claude. Call once per test file.
 */
export async function startTestApp() {
  const database = await testDatabase();
  const clock = new FakeClock();
  const outbox = new Outbox();
  const claude = new FakeClaude();
  const db = createDatabase(database.apiUrl, { max: 4 });
  const boss = await startTestBoss(database.apiUrl);
  const deps: Deps = {
    db,
    clock,
    mailer: outbox.mailer,
    sms: outbox.sms,
    claude,
    jobs: createTestJobs(boss, clock),
  };
  const app = createApp(deps, {
    webOrigin: WEB_ORIGIN,
    authSecret: "test-secret-test-secret-test-secret-0123",
  });
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const apiOrigin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const scenario = new Scenario(database.ownerUrl, clock);

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await boss.stop({ graceful: false });
    await scenario.close();
    await db.close();
  });

  /** A typed client with no session, as an anonymous browser. */
  const anonymous = () => createApiClient({ baseUrl: `${apiOrigin}/api` });

  /** Signs `user` in through the email code flow and returns a typed client for their session. */
  const signedInAs = async (user: UserFixture) => {
    const cookie = await signIn({ apiOrigin, webOrigin: WEB_ORIGIN, outbox, email: user.email });
    return createApiClient({ baseUrl: `${apiOrigin}/api`, headers: { cookie } });
  };

  return {
    apiOrigin,
    webOrigin: WEB_ORIGIN,
    deps,
    boss,
    clock,
    outbox,
    claude,
    scenario,
    anonymous,
    signedInAs,
  };
}
