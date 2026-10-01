"use client";

import Link from "next/link";
import { Download, MoreVertical, Search } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { CopyButton } from "~/components/copy-button";
import { DataTable, rowActionsColumn } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { StatusBadge } from "~/components/patterns/status-badge";

export interface TraineeListRow {
  id: string;
  publicId: string;
  fullName: string;
  district: string;
  consentGiven: boolean;
}

/** Client-side CSV of the loaded page rows (idea bag #6 pattern — Blob, no backend route). */
function downloadCsv(rows: TraineeListRow[]) {
  const header = ["Name", "Trainee ID", "District", "Consent"];
  const body = rows.map((r) => [
    r.fullName,
    r.publicId,
    r.district,
    r.consentGiven ? "Given" : "Pending",
  ]);
  const csv = [header, ...body]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trainees.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const traineeColumns: ColumnDef<TraineeListRow, unknown>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
  },
  {
    accessorKey: "publicId",
    header: "Trainee ID",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="font-mono text-caption font-medium text-primary-strong">{row.original.publicId}</span>
        <CopyButton value={row.original.publicId} />
      </div>
    ),
  },
  {
    accessorKey: "district",
    header: "District",
  },
  {
    accessorKey: "consentGiven",
    header: "Consent",
    cell: ({ row }) => (
      <StatusBadge status={row.original.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
    ),
  },
  rowActionsColumn((row) => (
    <Button variant="ghost" size="sm" asChild>
      <Link href={`/trainees/${row.publicId}`}>View</Link>
    </Button>
  )),
];

/**
 * Trainees table per §9.4/§4.5 — client view of the server-fetched page.
 * Server-side search (GET form) + export kebab in the toolbar; sortable
 * columns; server-side pagination lives in the page below this card.
 * Column defs live here because cell renderers can't cross the server/client
 * boundary (same split as dashboard-view.tsx).
 */
export function TraineesTable({ rows, query }: { rows: TraineeListRow[]; query: string }) {
  return (
    <DataTable
      columns={traineeColumns}
      data={rows}
      title="All trainees"
      toolbar={
        <>
          <form method="GET" action="/trainees" className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by ID or name…"
              className="h-8 pl-10"
              aria-label="Search trainees"
            />
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="More actions">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2" onSelect={() => downloadCsv(rows)}>
                <Download />
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      pageSize={25}
      emptyState={
        <EmptyState
          title="No trainees found"
          description={query ? `No matches for "${query}".` : "Trainees appear here once enrolled."}
        />
      }
      mobileCard={(t) => (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{t.fullName}</p>
            <StatusBadge status={t.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="font-mono text-caption text-primary-strong">{t.publicId}</span>
            <CopyButton value={t.publicId} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-body-sm text-muted-foreground">{t.district}</p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trainees/${t.publicId}`}>View</Link>
            </Button>
          </div>
        </div>
      )}
    />
  );
}
