import { MAX_SEED } from "@opsell/contract";
import { Page, PageHead } from "@opsell/ui";
import type { Metadata } from "next";
import { connection } from "next/server";
import { NewDemoOrganizationForm } from "./new-demo-organization-form";

export const metadata: Metadata = { title: "New Demo Organization" };

export default async function NewDemoOrganizationPage() {
  // A fresh suggested seed per visit, chosen on the server so the form hydrates without a flash.
  await connection();
  const suggestedSeed = Math.floor(Math.random() * Math.min(MAX_SEED, 1_000_000));

  return (
    <Page>
      <PageHead title="New Demo Organization" scope={["Two Locations", "Seven Business Days"]} />
      <NewDemoOrganizationForm suggestedSeed={suggestedSeed} />
    </Page>
  );
}
