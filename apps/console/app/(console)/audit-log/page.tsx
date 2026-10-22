import type { PlatformAction, PlatformAuditEntry } from "@opsell/contract";
import {
  EmptyState,
  Page,
  PageHead,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@opsell/ui";
import { ScrollText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirectForStatus, serverConsoleApi } from "@/lib/api";
import { timestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Audit log" };

const ACTIONS: Record<PlatformAction, string> = {
  "staff.passkey_enrolled": "Enrolled a passkey",
  "staff.signed_in": "Signed in",
  "demo_organization.created": "Created a Demo Organization",
};

function Subject({ entry }: { entry: PlatformAuditEntry }) {
  if (entry.action === "demo_organization.created" && entry.organizationId) {
    const name = typeof entry.details.name === "string" ? entry.details.name : "Demo Organization";
    return (
      <Link
        href={`/demo-organizations/${entry.organizationId}`}
        className="text-text-primary underline-offset-4 hover:underline"
      >
        {name}
        {typeof entry.details.seed === "number" ? (
          <span className="text-text-tertiary"> · seed {entry.details.seed}</span>
        ) : null}
      </Link>
    );
  }
  return <span className="text-text-tertiary">—</span>;
}

export default async function AuditLogPage() {
  const { data, response } = await (await serverConsoleApi()).GET("/audit-log");
  redirectForStatus(response.status);
  if (!data) throw new Error(`GET /audit-log failed with ${response.status}`);
  const { entries } = data;

  return (
    <Page>
      <PageHead title="Audit log" scope={["Every Platform Staff console action", "Newest first"]} />
      {entries.length ? (
        <Table aria-label="Audit log">
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead className="max-tablet:hidden">Who</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="max-tablet:hidden">From</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-text-secondary">{timestamp(entry.occurredAt)}</TableCell>
                <TableCell className="max-tablet:hidden" title={entry.staff.email}>
                  {entry.staff.name}
                </TableCell>
                <TableCell className="max-tablet:h-auto max-tablet:py-2.5">
                  <span className="block font-medium">{ACTIONS[entry.action]}</span>
                  {/* On a phone who did it rides under the action instead of in its own column. */}
                  <span className="block text-[13px] text-text-secondary leading-[18px] tablet:hidden">
                    {entry.staff.name}
                  </span>
                </TableCell>
                <TableCell>
                  <Subject entry={entry} />
                </TableCell>
                <TableCell
                  className="max-w-[24ch] truncate font-mono text-[13px] text-text-secondary max-tablet:hidden"
                  title={
                    [entry.ipAddress, entry.userAgent].filter(Boolean).join(" · ") || undefined
                  }
                >
                  {entry.ipAddress ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-lg border border-border-default bg-surface-card">
          <EmptyState icon={ScrollText} title="No console actions yet" />
        </div>
      )}
    </Page>
  );
}
