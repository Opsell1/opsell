import { describe, expect, it } from "vitest";
import { startTestApp } from "./support.ts";

const t = await startTestApp();

describe("GET /me", () => {
  it("answers 401 without a session", async () => {
    const { response, error } = await t.anonymous().GET("/me");

    expect(response.status).toBe(401);
    expect(error).toEqual({ error: { code: "unauthorized", message: expect.any(String) } });
  });

  it("describes the signed-in User, their Organization and Role", async () => {
    const org = await t.scenario.organization({ name: "Larkspur Bakehouse" });

    const { data, response } = await (await t.signedInAs(org.admin)).GET("/me");

    expect(response.status).toBe(200);
    expect(data).toEqual({
      user: { id: org.admin.id, name: org.admin.name, email: org.admin.email },
      organization: { id: org.id, name: "Larkspur Bakehouse", isDemo: false },
      role: "org_admin",
    });
  });

  it("acts in one Organization for a User who holds Roles in two", async () => {
    const first = await t.scenario.organization({ locations: [{ name: "Mass Ave" }] });
    const second = await t.scenario.organization({ locations: [{ name: "South Lamar" }] });
    await t.scenario.membership(second.id, first.admin.id, "org_admin");

    const api = await t.signedInAs(first.admin);
    const me = await api.GET("/me");
    const locations = await api.GET("/locations");

    expect(me.data?.organization.id).toBe(first.id);
    expect(locations.data?.locations.map((l) => l.name)).toEqual(["Mass Ave"]);
  });

  it("does not sign in an address that has no User", async () => {
    const response = await fetch(`${t.apiOrigin}/api/auth/sign-in/email-otp`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: t.webOrigin },
      body: JSON.stringify({ email: "stranger@nowhere.example", otp: "000000" }),
    });

    expect(response.ok).toBe(false);
    expect(t.outbox.emailsTo("stranger@nowhere.example")).toEqual([]);
  });
});
