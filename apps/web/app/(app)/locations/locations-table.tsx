import type { Location } from "@opsell/contract";
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@opsell/ui";
import { timeZoneLabel } from "@/lib/time-zone";

function Header() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Location</TableHead>
        <TableHead className="max-tablet:hidden">City</TableHead>
        <TableHead>Time zone</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export function LocationsTable({ locations }: { locations: Location[] }) {
  return (
    <Table aria-label="Locations">
      <Header />
      <TableBody>
        {locations.map((location) => (
          <TableRow key={location.id}>
            <TableCell className="max-tablet:h-auto max-tablet:py-2.5">
              <span className="block font-medium">{location.name}</span>
              {/* On a phone the city rides under the name instead of in its own column. */}
              <span className="block text-[13px] text-text-secondary leading-[18px] tablet:hidden">
                {location.city}, {location.state}
              </span>
            </TableCell>
            <TableCell className="text-text-secondary max-tablet:hidden">
              {location.city}, {location.state}
            </TableCell>
            <TableCell className="text-text-secondary" title={location.timeZone}>
              {timeZoneLabel(location.timeZone)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const SKELETON_WIDTHS = [
  ["w-24", "w-32", "w-24"],
  ["w-20", "w-28", "w-24"],
  ["w-24", "w-24", "w-28"],
  ["w-16", "w-32", "w-28"],
  ["w-28", "w-24", "w-24"],
] as const;

export function LocationsTableSkeleton() {
  return (
    <Table aria-label="Loading Locations" aria-busy>
      <Header />
      <TableBody>
        {SKELETON_WIDTHS.map((widths) => (
          <TableRow key={widths.join()}>
            {widths.map((width, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholder columns.
              <TableCell key={i} className={i === 1 ? "max-tablet:hidden" : undefined}>
                <Skeleton className={`h-3 ${width}`} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
