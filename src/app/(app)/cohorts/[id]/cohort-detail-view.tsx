"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, RefreshCw, Send } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { CopyButton } from "~/components/copy-button";
import { DataTable, rowActionsColumn } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { date } from "~/lib/format";
import { toast } from "sonner";

export interface CohortTraineeRow {
  traineeId: string;
  publicId: string;
  fullName: string;
  phone: string;
  district: string;
  followupStatus: string;
}

/** Client-side CSV of the loaded rows (idea bag #6 pattern — Blob, no backend route). */
function downloadCsv(rows: CohortTraineeRow[], cohortName: string) {
  const header = ["Name", "Phone", "District", "Follow-up Status"];
  const body = rows.map((r) => [r.fullName, r.phone, r.district, r.followupStatus]);
  const csv = [header, ...body]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cohortName.toLowerCase().replace(/\s+/g, "-")}-trainees.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const traineeColumns: ColumnDef<CohortTraineeRow, unknown>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span className="font-mono">{row.original.phone}</span>,
  },
  {
    accessorKey: "district",
    header: "District",
  },
  {
    accessorKey: "followupStatus",
    header: "Follow-up status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.followupStatus as StatusKey} />
    ),
  },
  rowActionsColumn((row) => (
    <Button variant="ghost" size="sm" asChild>
      <Link href={`/trainees/${row.publicId}`}>View</Link>
    </Button>
  )),
];

/**
 * Cohort detail per §9.5 — client view of the server-fetched cohort.
 * Actions (Export CSV, Refresh, Trigger follow-up) live here because they
 * need event handlers; the data fetch stays in the server page.
 */
export function CohortDetailView({
  cohortId,
  cohortName,
  programmeName,
  startDate,
  endDate,
  rows,
}: {
  cohortId: string;
  cohortName: string;
  programmeName: string;
  startDate: string;
  endDate: string;
  rows: CohortTraineeRow[];
}) {
  const router = useRouter();
  const [triggering, setTriggering] = useState(false);

  const handleTriggerFollowup = async () => {
    setTriggering(true);
    try {
      const res = await fetch(`/api/v1/cohorts/${cohortId}/followups/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkpointDays: 30 }),
      });
      if (res.ok) {
        toast.success("30-day follow-up triggered");
        router.refresh();
      } else {
        toast.error("Failed to trigger follow-up");
      }
    } catch {
      toast.error("Failed to trigger follow-up");
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb (§9.5 — above H1, mb-2) */}
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex items-center gap-1 text-caption text-muted-foreground"
      >
        <Link
          href="/dashboard"
          className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          Dashboard
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-foreground" aria-current="page">{cohortName}</span>
      </nav>

      {/* H1 + action row (§9.5 header; CL-05 — one primary) */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-h1 font-medium tracking-tight">{cohortName}</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {programmeName} · {date(startDate)} – {date(endDate)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => downloadCsv(rows, cohortName)}>
            <Download />
            Export CSV
          </Button>
          <Button variant="ghost" onClick={() => router.refresh()} aria-label="Refresh">
            <RefreshCw />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={triggering}>
                <Send />
                Trigger 30-day follow-up
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Trigger 30-day follow-up?</AlertDialogTitle>
                <AlertDialogDescription>
                  This queues a 30-day checkpoint follow-up for every trainee in{" "}
                  {cohortName} that does not have one yet.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTriggerFollowup}>
                  Trigger
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <DataTable
        columns={traineeColumns}
        data={rows}
        title={`Trainees (${rows.length})`}
        pageSize={25}
        emptyState={
          <EmptyState
            title="No trainees enrolled"
            description="Trainees appear here once they are enrolled in this cohort."
          />
        }
        mobileCard={(t) => (
          <div className="rounded-lg border bg-card p-4">
            <p className="font-medium">{t.fullName}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="font-mono text-caption text-primary-strong">{t.publicId}</span>
              <CopyButton value={t.publicId} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-body-sm text-muted-foreground">{t.district}</p>
              <StatusBadge status={t.followupStatus as StatusKey} />
            </div>
            <Button variant="outline" size="sm" asChild className="mt-3 w-full">
              <Link href={`/trainees/${t.publicId}`}>View</Link>
            </Button>
          </div>
        )}
      />
    </div>
  );
}
