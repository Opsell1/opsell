import {
  Button,
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
import { Plus, Presentation } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirectForStatus, serverConsoleApi } from "@/lib/api";
import { timestamp } from "@/lib/format";

export const metadata: Metadata = { title: "Demo Organizations" };

export default async function DemoOrganizationsPage() {
  const { data, response } = await (await serverConsoleApi()).GET("/demo-organizations");
  redirectForStatus(response.status);
  if (!data) throw new Error(`GET /demo-organizations failed with ${response.status}`);
  const { demoOrganizations } = data;

  const newButton = (
    <Button asChild variant="primary">
      <Link href="/demo-organizations/new">
        <Plus size={16} aria-hidden />
        New Demo Organization
      </Link>
    </Button>
  );

  return (
    <Page>
      <PageHead
        title="Demo Organizations"
        scope={[
          `${demoOrganizations.length} ${demoOrganizations.length === 1 ? "Demo Organization" : "Demo Organizations"}`,
          "Fictional data only",
        ]}
        actions={demoOrganizations.length ? newButton : undefined}
      />
      {demoOrganizations.length ? (
        <Table aria-label="Demo Organizations">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Seed</TableHead>
              <TableHead className="max-tablet:hidden">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoOrganizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <Link
                    href={`/demo-organizations/${org.id}`}
                    className="font-medium text-text-primary underline-offset-4 hover:underline"
                  >
                    {org.name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-text-secondary">{org.seed}</TableCell>
                <TableCell className="text-text-secondary max-tablet:hidden">
                  {timestamp(org.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-lg border border-border-default bg-surface-card">
          <EmptyState icon={Presentation} title="No Demo Organizations yet" action={newButton}>
            Create one from a seed to show Opsell to a prospect with fictional data.
          </EmptyState>
        </div>
      )}
    </Page>
  );
}
