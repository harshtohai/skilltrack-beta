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
import { StatusBadge, STATUS_MAP } from "~/components/patterns/status-badge";

export interface TraineeListRow {
  id: string;
  publicId: string;
  fullName: string;
  district: string;
  consentGiven: boolean;
  /** Enrolment lifecycle (INST-03); null when the trainee has no enrolments. */
  lifecycleStatus: "ACTIVE" | "DROPPED_OUT" | "COMPLETED" | null;
}

export type TraineeLifecycleTab = "all" | "ACTIVE" | "DROPPED_OUT" | "COMPLETED";

/** Client-side CSV of the loaded page rows (idea bag #6 pattern — Blob, no backend route). */
function downloadCsv(rows: TraineeListRow[]) {
  const header = ["Name", "Trainee ID", "District", "Consent", "Status"];
  const body = rows.map((r) => [
    r.fullName,
    r.publicId,
    r.district,
    r.consentGiven ? "Given" : "Pending",
    r.lifecycleStatus ? STATUS_MAP[r.lifecycleStatus]?.label ?? "" : "",
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
  {
    accessorKey: "lifecycleStatus",
    header: "Status",
    cell: ({ row }) =>
      row.original.lifecycleStatus ? (
        <StatusBadge status={row.original.lifecycleStatus} />
      ) : (
        <span className="text-body-sm text-muted-foreground">—</span>
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
export function TraineesTable({
  rows,
  query,
  status,
  total,
}: {
  rows: TraineeListRow[];
  query: string;
  /** Active lifecycle tab — preserved through the search form. */
  status?: TraineeLifecycleTab;
  /** Server-side total (all pages) — makes the DataTable count honest. */
  total?: number;
}) {
  return (
    <DataTable
      columns={traineeColumns}
      data={rows}
      title="All trainees"
      serverTotal={total}
      toolbar={
        <>
          <form method="GET" action="/trainees" className="relative w-full sm:w-56">
            {status && status !== "ACTIVE" ? (
              <input type="hidden" name="status" value={status} />
            ) : null}
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by ID or name…"
              className="h-8 pl-10 pr-9"
              aria-label="Search trainees"
            />
            <Button
              type="submit"
              variant="outline"
              size="icon-sm"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Search />
            </Button>
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
            <div className="flex items-center gap-1.5">
              {t.lifecycleStatus ? <StatusBadge status={t.lifecycleStatus} /> : null}
              <StatusBadge status={t.consentGiven ? "GIVEN" : "PENDING_CONSENT"} />
            </div>
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
