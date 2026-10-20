import { Page, PageHead, Skeleton } from "@opsell/ui";
import { LocationsTableSkeleton } from "./locations-table";

export default function LoadingLocations() {
  return (
    <Page>
      <PageHead title="Locations" scope={[<Skeleton key="count" className="my-1.5 h-2 w-20" />]} />
      <LocationsTableSkeleton />
    </Page>
  );
}
