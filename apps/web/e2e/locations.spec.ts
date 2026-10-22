import { SEED } from "@opsell/db/admin";
import { expect, test } from "@playwright/test";
import { signInCodeFor } from "./mailpit.ts";

test("an Org Admin signs in with an email code and sees only their Organization's Locations", async ({
  page,
}) => {
  const { larkspur, juniper } = SEED;

  await page.goto("/locations");
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel("Email").fill(larkspur.orgAdmin.email);
  // Mailpit timestamps come from another clock; allow a little skew.
  const sentAfter = new Date(Date.now() - 5_000);
  await page.getByRole("button", { name: "Send code" }).click();
  await page
    .getByLabel("Sign-in code")
    .fill(await signInCodeFor(larkspur.orgAdmin.email, sentAfter));
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/locations$/);
  await expect(page.getByRole("heading", { level: 1, name: "Locations" })).toBeVisible();
  await expect(page.getByText(`${larkspur.locations.length} Locations`)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toContainText(larkspur.name);

  const table = page.getByRole("table", { name: "Locations" });
  const names = larkspur.locations.map((l) => l.name).sort();
  await expect(table.locator("tbody tr td:first-child span:first-child")).toHaveText(names);
  for (const theirs of juniper.locations) await expect(table).not.toContainText(theirs.name);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/locations");
  await expect(page).toHaveURL(/\/sign-in$/);
});
