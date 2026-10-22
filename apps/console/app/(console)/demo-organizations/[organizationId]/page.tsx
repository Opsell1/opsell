import type { DemoOrganization } from "@opsell/contract";
import {
  Page,
  PageHead,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@opsell/ui";
import { LoaderCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { redirectForStatus, serverConsoleApi } from "@/lib/api";
import { count, dateRange, dayCount, dollars, hours, timestamp } from "@/lib/format";
import { timeZoneLabel } from "@/lib/time-zone";
import { RefreshWhilePending } from "./refresh-while-pending";

type Params = { params: Promise<{ organizationId: string }> };

/** Fetched once per request, for both the metadata and the page. */
const load = cache(async (organizationId: string): Promise<DemoOrganization> => {
  const { data, response } = await (await serverConsoleApi()).GET(
    "/demo-organizations/{organizationId}",
    { params: { path: { organizationId } } },
  );
  redirectForStatus(response.status);
  if (response.status === 404 || response.status === 400) notFound();
  if (!data) throw new Error(`GET /demo-organizations/{id} failed with ${response.status}`);
  return data;
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: (await load((await params).organizationId)).name };
}

export default async function DemoOrganizationPage({ params }: Params) {
  const org = await load((await params).organizationId);
  const pending = org.backfill === "pending";

  return (
    <Page>
      <PageHead
        title={org.name}
        scope={[`Seed ${org.seed}`, `Created ${timestamp(org.createdAt)}`]}
      />
      <RefreshWhilePending pending={pending} />

      <section aria-label="Source data" className="grid gap-3">
        <h2 className="m-0 text-h3">Source data</h2>
        {pending ? (
          <output className="flex items-center gap-2.5 rounded-md border border-border-default bg-surface-card px-3 py-2.5 text-[13px] text-text-secondary leading-[18px]">
            <LoaderCircle
              size={16}
              aria-hidden
              className="animate-spin motion-reduce:animate-none"
            />
            Filling the last seven Business Days from the mock data source…
          </output>
        ) : (
          <dl className="m-0 grid grid-cols-4 gap-3 max-tablet:grid-cols-2">
            <Figure
              label="Business Days"
              value={
                org.firstBusinessDate && org.lastBusinessDate
                  ? dateRange(org.firstBusinessDate, org.lastBusinessDate)
                  : "None"
              }
              note={
                org.firstBusinessDate && org.lastBusinessDate
                  ? `${count(dayCount(org.firstBusinessDate, org.lastBusinessDate))} days, ending yesterday`
                  : undefined
              }
            />
            <Figure
              label="Net sales"
              value={dollars(org.totals.netSalesCents)}
              note={`${count(org.totals.salesOrders)} orders`}
            />
            <Figure
              label="Hours worked"
              value={hours(org.totals.workedMinutes)}
              note={`${count(org.totals.timeEntries)} time entries`}
            />
            <Figure
              label="Staff tips"
              value={dollars(org.totals.staffTipsCents)}
              note={`${count(org.totals.tipEntries)} tip entries`}
            />
          </dl>
        )}
      </section>

      <section aria-label="Locations" className="grid gap-3">
        <h2 className="m-0 text-h3">
          Locations{" "}
          <span className="font-normal text-text-tertiary">· {count(org.employees)} Employees</span>
        </h2>
        <Table aria-label="Locations">
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead className="max-tablet:hidden">Time zone</TableHead>
              <TableHead className="text-right">Employees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {org.locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="h-auto py-2.5">
                  <span className="block font-medium">{location.name}</span>
                  <span className="block text-[13px] text-text-secondary leading-[18px]">
                    {location.city}, {location.state}
                  </span>
                </TableCell>
                <TableCell
                  className="text-text-secondary max-tablet:hidden"
                  title={location.timeZone}
                >
                  {timeZoneLabel(location.timeZone)}
                </TableCell>
                <TableCell className="text-right">{count(location.employees)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section aria-label="Positions" className="grid gap-3">
        <h2 className="m-0 text-h3">Positions</h2>
        <Table aria-label="Positions">
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>House</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {org.positions.map((position) => (
              <TableRow key={position.name}>
                <TableCell className="font-medium">{position.name}</TableCell>
                <TableCell className="text-text-secondary">
                  {position.house === "front" ? "Front of house" : "Back of house"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </Page>
  );
}

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="grid content-start gap-1 rounded-lg border border-border-default bg-surface-card p-4 shadow-elev-card">
      <dt className="font-medium text-[12px] text-text-tertiary">{label}</dt>
      <dd className="m-0 text-kpi-sm tabular-nums">{value}</dd>
      {note ? <dd className="m-0 text-[12px] text-text-secondary tabular-nums">{note}</dd> : null}
    </div>
  );
}
