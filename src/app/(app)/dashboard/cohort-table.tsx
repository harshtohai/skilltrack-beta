"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { DataTable, rowActionsColumn } from "~/components/patterns/data-table";
import { EmptyState } from "~/components/patterns/empty-state";
import { number, percent, date as fmtDate } from "~/lib/format";
import type { Cohort, InstituteCohort } from "./types";

const cohortColumns: ColumnDef<Cohort, unknown>[] = [
  {
    accessorKey: "name",
    header: "Cohort",
    cell: ({ row }) => (
      <Link href={`/cohorts/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "programme",
    accessorFn: (row) => row.programme.name,
    header: "Programme",
  },
  {
    id: "trainees",
    accessorFn: (row) => row._count.enrolments,
    header: "Trainees",
    cell: ({ row }) => (
      <span className="tabular-nums">{number(row.original._count.enrolments)}</span>
    ),
  },
  {
    accessorKey: "endDate",
    header: "Certification ends",
    cell: ({ row }) => fmtDate(row.original.endDate),
  },
  rowActionsColumn((row) => (
    <Button variant="ghost" size="icon-xs" asChild aria-label={`Open ${row.name}`}>
      <Link href={`/cohorts/${row.id}`}>
        <ArrowUpRight />
      </Link>
    </Button>
  )),
];

/** Admin cohort table (§9.1 cohorts slot, 8/12). */
export function AdminCohortTable({
  cohorts,
  loading,
}: {
  cohorts: Cohort[];
  loading: boolean;
}) {
  return (
    <DataTable
      columns={cohortColumns}
      data={cohorts}
      loading={loading}
      title="Cohorts"
      searchPlaceholder="Search cohorts…"
      emptyState={
        <EmptyState
          title="No cohorts yet"
          description="Cohorts appear here once trainees are enrolled."
        />
      }
      mobileCard={(cohort) => (
        <div className="rounded-lg bg-muted/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <Link href={`/cohorts/${cohort.id}`} className="text-body-sm font-medium hover:underline">
              {cohort.name}
            </Link>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-1 text-caption text-muted-foreground">
            {cohort.programme.name} · {number(cohort._count.enrolments)} trainees · ends{" "}
            {fmtDate(cohort.endDate)}
          </p>
        </div>
      )}
    />
  );
}

const instituteCohortColumns: ColumnDef<InstituteCohort, unknown>[] = [
  {
    accessorKey: "name",
    header: "Cohort",
    cell: ({ row }) => (
      <Link href={`/cohorts/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "trainees",
    accessorFn: (row) => row.trainees,
    header: "Trainees",
    cell: ({ row }) => <span className="tabular-nums">{number(row.original.trainees)}</span>,
  },
  {
    id: "placementRate",
    accessorFn: (row) => row.placementRate,
    header: "Placement rate",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {percent(row.original.placementRate, { sign: false, digits: 1 })}
      </span>
    ),
  },
  rowActionsColumn((row) => (
    <Button variant="ghost" size="icon-xs" asChild aria-label={`Open ${row.name}`}>
      <Link href={`/cohorts/${row.id}`}>
        <ArrowUpRight />
      </Link>
    </Button>
  )),
];

/** Institute cohort-performance table (INST-04, §9.1 cohorts slot, 8/12). */
export function InstituteCohortTable({
  cohorts,
  loading,
}: {
  cohorts: InstituteCohort[];
  loading: boolean;
}) {
  return (
    <DataTable
      columns={instituteCohortColumns}
      data={cohorts}
      loading={loading}
      title="Cohort performance"
      emptyState={
        <EmptyState
          title="No cohorts yet"
          description="Cohorts appear here once trainees are enrolled at your center."
        />
      }
      mobileCard={(cohort) => (
        <div className="rounded-lg bg-muted/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <Link href={`/cohorts/${cohort.id}`} className="text-body-sm font-medium hover:underline">
              {cohort.name}
            </Link>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-1 text-caption text-muted-foreground">
            {cohort.programme} · {number(cohort.trainees)} trainees ·{" "}
            {percent(cohort.placementRate, { sign: false, digits: 1 })} placed
          </p>
        </div>
      )}
    />
  );
}
