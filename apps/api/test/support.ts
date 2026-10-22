import type { AddressInfo } from "node:net";
import { createApiClient } from "@opsell/contract";
import { createTestDeps, Scenario, signIn, testDatabase, type UserFixture } from "@opsell/testing";
import { afterAll } from "vitest";
import { createApp } from "../src/index.ts";

const WEB_ORIGIN = "http://web.test";

/**
 * Starts the real Express app in-process on a free port, wired to this worker's test database
 * as the API role and to fakes for time, mail, SMS and Claude. Call once per test file.
 */
export async function startTestApp() {
  const database = await testDatabase();
  const testDeps = await createTestDeps(database.apiUrl);
  const app = createApp(testDeps.deps, {
    webOrigin: WEB_ORIGIN,
    authSecret: "test-secret-test-secret-test-secret-0123",
  });
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const apiOrigin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const scenario = new Scenario(database.ownerUrl, testDeps.clock);

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await testDeps.stop();
    await scenario.close();
  });

  /** A typed client with no session, as an anonymous browser. */
  const anonymous = () => createApiClient({ baseUrl: `${apiOrigin}/api` });

  /** Signs `user` in through the email code flow and returns a typed client for their session. */
  const signedInAs = async (user: UserFixture) => {
    const cookie = await signIn({
      apiOrigin,
      webOrigin: WEB_ORIGIN,
      outbox: testDeps.outbox,
      email: user.email,
    });
    return createApiClient({ baseUrl: `${apiOrigin}/api`, headers: { cookie } });
  };

  return { ...testDeps, apiOrigin, webOrigin: WEB_ORIGIN, scenario, anonymous, signedInAs };
}
