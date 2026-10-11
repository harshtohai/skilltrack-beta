"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { number, percent } from "~/lib/format";
import type { InstituteAnalyticsData } from "./types";

type Cohort = InstituteAnalyticsData["cohorts"][number];

/** Cohort performance table (§4.5 — tabular numbers). */
export const cohortColumns: ColumnDef<Cohort, unknown>[] = [
  {
    accessorKey: "name",
    header: "Cohort",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "programme",
    header: "Programme",
  },
  {
    accessorKey: "traineeCount",
    header: "Trainees",
    cell: ({ row }) => (
      <span className="tabular-nums">{number(row.original.traineeCount)}</span>
    ),
  },
  {
    accessorKey: "placementRate",
    header: "Placement rate",
    cell: ({ row }) =>
      percent(row.original.placementRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "retentionRate",
    header: "Retention rate",
    cell: ({ row }) =>
      percent(row.original.retentionRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "verifiedRate",
    header: "Verified Rate",
    cell: ({ row }) =>
      percent(row.original.verifiedRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "wageProgressionRate",
    header: "Wage Progression",
    cell: ({ row }) =>
      percent(row.original.wageProgressionRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "certificatesPerTrainee",
    header: "Certs/Trainee",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.certificatesPerTrainee.toFixed(2)}
      </span>
    ),
  },
];
