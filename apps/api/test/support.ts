import type { AddressInfo } from "node:net";
import { createApiClient, createConsoleClient } from "@opsell/contract";
import { issueStaffEnrollment } from "@opsell/core";
import {
  createTestDeps,
  enrollPasskey,
  Scenario,
  type StaffFixture,
  signIn,
  testDatabase,
  type UserFixture,
  VirtualAuthenticator,
} from "@opsell/testing";
import { afterAll } from "vitest";
import { createApp } from "../src/index.ts";

const WEB_ORIGIN = "http://web.test";
const CONSOLE_ORIGIN = "http://console.test";

/**
 * Starts the real Express app in-process on a free port, wired to this worker's test database
 * as the API role and to fakes for time, mail, SMS and Claude. Call once per test file.
 */
export async function startTestApp() {
  const database = await testDatabase();
  const testDeps = await createTestDeps(database.apiUrl);
  const app = createApp(testDeps.deps, {
    webOrigin: WEB_ORIGIN,
    consoleOrigin: CONSOLE_ORIGIN,
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

  /** A typed console client, carrying `cookie` if given, as the console's browser would. */
  const consoleClient = (cookie?: string) =>
    createConsoleClient({
      baseUrl: `${apiOrigin}/api/console`,
      headers: { origin: CONSOLE_ORIGIN, ...(cookie ? { cookie } : {}) },
    });

  /** Issues an enrollment link for `staff`, as the invite command does, and returns its token. */
  const enrollmentToken = async (staff: StaffFixture) =>
    (await issueStaffEnrollment(testDeps.deps.db.global, staff, testDeps.clock.now())).token;

  /**
   * A Platform Staff member who has enrolled a passkey on their own authenticator, signed in to
   * the console.
   */
  const staffSignedIn = async (staff?: StaffFixture) => {
    const member = staff ?? (await scenario.staff());
    const authenticator = new VirtualAuthenticator();
    const { response, cookie } = await enrollPasskey({
      apiOrigin,
      consoleOrigin: CONSOLE_ORIGIN,
      authenticator,
      token: await enrollmentToken(member),
    });
    if (!response.ok)
      throw new Error(`Enrollment failed: ${response.status} ${await response.text()}`);
    return { staff: member, authenticator, cookie, api: consoleClient(cookie) };
  };

  return {
    ...testDeps,
    apiOrigin,
    webOrigin: WEB_ORIGIN,
    consoleOrigin: CONSOLE_ORIGIN,
    scenario,
    anonymous,
    signedInAs,
    consoleClient,
    enrollmentToken,
    staffSignedIn,
  };
}
