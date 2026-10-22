import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

const staffCli = fileURLToPath(new URL("../../api/dist/staff-cli.mjs", import.meta.url));

/** Issues an enrollment link with the operator command, the way a new staff member gets one. */
function inviteStaff(name: string, email: string): string {
  const output = execFileSync("node", [staffCli, "invite", "--name", name, "--email", email], {
    env: process.env,
    encoding: "utf8",
  });
  const link = output.match(/https?:\/\/\S+\/enroll#token=\S+/)?.[0];
  if (!link) throw new Error(`No enrollment link in:\n${output}`);
  return link;
}

/** A platform authenticator in this browser that creates and uses passkeys without prompts. */
async function addVirtualAuthenticator(page: Page): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
}

test("Platform Staff enroll a passkey, create a Demo Organization from a seed, and see it audited", async ({
  page,
}) => {
  const tag = Date.now().toString(36);
  const name = `Playwright pitch ${tag}`;
  await addVirtualAuthenticator(page);

  await page.goto("/demo-organizations");
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.goto(inviteStaff("Morgan Lee", `morgan-${tag}@opsell.example`));
  await page.getByRole("button", { name: "Create passkey" }).click();
  await expect(page).toHaveURL(/\/demo-organizations$/);
  await expect(page.getByRole("heading", { level: 1, name: "Demo Organizations" })).toBeVisible();

  await page.getByRole("link", { name: "New Demo Organization" }).first().click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Seed").fill("4242");
  await page.getByRole("button", { name: "Create Demo Organization" }).click();

  await expect(page).toHaveURL(/\/demo-organizations\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.getByText("Seed 4242")).toBeVisible();
  const locations = page.getByRole("table", { name: "Locations" });
  await expect(locations).toContainText("Elm St");
  await expect(locations).toContainText("Harbor St");
  await expect(page.getByRole("table", { name: "Positions" })).toContainText("Barista");
  // The worker backfills the recent Business Days; the page refreshes until it has.
  await expect(page.getByText("Net sales")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/\d[\d,]* orders/)).toBeVisible();

  await page.getByRole("link", { name: "Audit log" }).click();
  const log = page.getByRole("table", { name: "Audit log" });
  const created = log.getByRole("row").filter({ hasText: name });
  await expect(created).toContainText("Morgan Lee");
  await expect(created).toContainText("Created a Demo Organization");
  await expect(
    log.getByRole("row").filter({ hasText: "Enrolled a passkey" }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.getByRole("button", { name: "Sign in with a passkey" }).click();
  await expect(page).toHaveURL(/\/demo-organizations$/);
  await expect(page.getByRole("link", { name })).toBeVisible();
});
