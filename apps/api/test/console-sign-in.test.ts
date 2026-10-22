// Platform Staff sign in to the console with a passkey only, as an identity separate from every
// Organization user (ADR 0006).
import { enrollPasskey, signIn, signInWithPasskey, VirtualAuthenticator } from "@opsell/testing";
import { describe, expect, it } from "vitest";
import { startTestApp } from "./support.ts";

const t = await startTestApp();

describe("Platform Staff sign-in", () => {
  it("answers 401 without a session", async () => {
    const { response, error } = await t.consoleClient().GET("/me");

    expect(response.status).toBe(401);
    expect(error).toEqual({ error: { code: "unauthorized", message: expect.any(String) } });
  });

  it("enrolls a first passkey with a one-time link and signs the staff member in", async () => {
    const staff = await t.scenario.staff({ name: "Sam Rivera" });
    const { response, cookie } = await enrollPasskey({
      apiOrigin: t.apiOrigin,
      consoleOrigin: t.consoleOrigin,
      authenticator: new VirtualAuthenticator(),
      token: await t.enrollmentToken(staff),
    });

    const me = await t.consoleClient(cookie).GET("/me");

    expect(response.status).toBe(200);
    expect(me.data).toEqual({ id: staff.id, name: "Sam Rivera", email: staff.email });
  });

  it("signs back in with the passkey", async () => {
    const { staff, authenticator } = await t.staffSignedIn();

    const { response, cookie } = await signInWithPasskey({
      apiOrigin: t.apiOrigin,
      consoleOrigin: t.consoleOrigin,
      authenticator,
    });
    const me = await t.consoleClient(cookie).GET("/me");

    expect(response.status).toBe(200);
    expect(me.data?.id).toBe(staff.id);
  });

  it("does not sign in a passkey the console has never seen", async () => {
    const stranger = new VirtualAuthenticator();
    // A passkey for the console's site, but registered nowhere.
    stranger.register({ challenge: "AAAA", rp: { name: "Elsewhere" } }, t.consoleOrigin);

    const { response, cookie } = await signInWithPasskey({
      apiOrigin: t.apiOrigin,
      consoleOrigin: t.consoleOrigin,
      authenticator: stranger,
    });

    expect(response.ok).toBe(false);
    expect((await t.consoleClient(cookie).GET("/me")).response.status).toBe(401);
  });

  it("uses an enrollment link once", async () => {
    const staff = await t.scenario.staff();
    const token = await t.enrollmentToken(staff);
    const enroll = () =>
      enrollPasskey({
        apiOrigin: t.apiOrigin,
        consoleOrigin: t.consoleOrigin,
        authenticator: new VirtualAuthenticator(),
        token,
      });

    const first = await enroll();
    const second = await enroll();

    expect(first.response.status).toBe(200);
    expect(second.response.ok).toBe(false);
    expect((await t.consoleClient(second.cookie).GET("/me")).response.status).toBe(401);
  });

  it("refuses an enrollment link after it expires", async () => {
    const staff = await t.scenario.staff();
    const token = await t.enrollmentToken(staff);
    t.clock.advance({ hours: 25 });

    const { response } = await enrollPasskey({
      apiOrigin: t.apiOrigin,
      consoleOrigin: t.consoleOrigin,
      authenticator: new VirtualAuthenticator(),
      token,
    });

    expect(response.ok).toBe(false);
  });

  it("offers no way to sign in to the console other than a passkey", async () => {
    const { staff } = await t.staffSignedIn();
    const post = (path: string, body: unknown) =>
      fetch(`${t.apiOrigin}/api/console/auth${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: t.consoleOrigin },
        body: JSON.stringify(body),
      });

    const code = await post("/email-otp/send-verification-otp", {
      email: staff.email,
      type: "sign-in",
    });
    const password = await post("/sign-in/email", { email: staff.email, password: "hunter22" });
    const signUp = await post("/sign-up/email", {
      email: "new-staff@opsell.example",
      password: "correct horse battery staple",
      name: "Someone",
    });

    expect(code.status).toBe(404);
    expect(password.ok).toBe(false);
    expect(signUp.ok).toBe(false);
    expect(t.outbox.emailsTo(staff.email)).toEqual([]);
  });

  it("keeps staff accounts out of Organizations, and Organization users out of the console", async () => {
    const { staff, cookie: staffCookie } = await t.staffSignedIn();
    const org = await t.scenario.organization();
    const userCookie = await signIn({
      apiOrigin: t.apiOrigin,
      webOrigin: t.webOrigin,
      outbox: t.outbox,
      email: org.orgAdmin.email,
    });

    const staffAsUser = await fetch(`${t.apiOrigin}/api/me`, { headers: { cookie: staffCookie } });
    const userAsStaff = await t.consoleClient(userCookie).GET("/me");
    // The customer sign-in does not know Platform Staff, so no code is ever sent to them.
    await fetch(`${t.apiOrigin}/api/auth/email-otp/send-verification-otp`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: t.webOrigin },
      body: JSON.stringify({ email: staff.email, type: "sign-in" }),
    });

    expect(staffAsUser.status).toBe(401);
    expect(userAsStaff.response.status).toBe(401);
    expect(t.outbox.emailsTo(staff.email)).toEqual([]);
  });
});
