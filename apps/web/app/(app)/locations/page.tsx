import { EmptyState, Page, PageHead } from "@opsell/ui";
import { Store } from "lucide-react";
import type { Metadata } from "next";
import { redirectForStatus, serverApi } from "@/lib/api";
import { LocationsTable } from "./locations-table";

export const metadata: Metadata = { title: "Locations" };

export default async function LocationsPage() {
  const { data, response } = await (await serverApi()).GET("/locations");
  redirectForStatus(response.status);
  if (!data) throw new Error(`GET /locations failed with ${response.status}`);
  const { locations } = data;

  return (
    <Page>
      <PageHead
        title="Locations"
        scope={[`${locations.length} ${locations.length === 1 ? "Location" : "Locations"}`]}
      />
      {locations.length ? (
        <LocationsTable locations={locations} />
      ) : (
        <div className="rounded-lg border border-border-default bg-surface-card">
          <EmptyState icon={Store} title="No Locations yet">
            Your Organization's Locations will appear here once an Org Admin adds them.
          </EmptyState>
        </div>
      )}
    </Page>
  );
}
