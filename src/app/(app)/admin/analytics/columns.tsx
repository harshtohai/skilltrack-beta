"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ScoreBadge } from "~/components/patterns/status-badge";
import { number, percent } from "~/lib/format";
import type { MonthlyData, TrainingCenterScore } from "./types";

/** Training centre leaderboard (§4.5 — overall score pill per formula note). */
export const leaderboardColumns: ColumnDef<TrainingCenterScore, unknown>[] = [
  {
    id: "rank",
    header: "#",
    cell: ({ row }) => (
      <span className="text-body-sm text-muted-foreground tabular-nums">
        {row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: "centerName",
    header: "Training center",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.centerName}</span>
    ),
  },
  {
    id: "overallScore",
    accessorFn: (row) => row.overallScore,
    header: "Overall",
    cell: ({ row }) => <ScoreBadge score={row.original.overallScore} />,
  },
  {
    accessorKey: "placementScore",
    header: "Placement",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.placementScore}</span>
    ),
  },
  {
    accessorKey: "academicScore",
    header: "Academic",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.academicScore}</span>
    ),
  },
  {
    accessorKey: "volumeScore",
    header: "Volume",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.volumeScore}</span>
    ),
  },
  {
    id: "certified",
    accessorFn: (row) => row.numerators.certifiedCount,
    header: "Certified",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {number(row.original.numerators.certifiedCount)}
      </span>
    ),
  },
  {
    id: "knownOutcomes",
    accessorFn: (row) => row.numerators.outcomesKnown,
    header: "Known Outcomes",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {number(row.original.numerators.outcomesKnown)}
      </span>
    ),
  },
  {
    id: "verified",
    accessorFn: (row) => row.numerators.employedVerified,
    header: "Verified",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {number(row.original.numerators.employedVerified)}
      </span>
    ),
  },
];

/** Month-by-month outcomes table (§4.5). */
export const monthlyColumns: ColumnDef<MonthlyData, unknown>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.month}</span>
    ),
  },
  {
    accessorKey: "certified",
    header: "Certified",
    cell: ({ row }) => (
      <span className="tabular-nums">{number(row.original.certified)}</span>
    ),
  },
  {
    accessorKey: "employed",
    header: "Employed",
    cell: ({ row }) => (
      <span className="tabular-nums">{number(row.original.employed)}</span>
    ),
  },
  {
    accessorKey: "placementRate",
    header: "Placement %",
    cell: ({ row }) =>
      percent(row.original.placementRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "retained90",
    header: "Retained 90",
    cell: ({ row }) => (
      <span className="tabular-nums">{number(row.original.retained90)}</span>
    ),
  },
  {
    accessorKey: "retentionRate",
    header: "Retention %",
    cell: ({ row }) =>
      percent(row.original.retentionRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "verifiedRate",
    header: "Verified %",
    cell: ({ row }) =>
      percent(row.original.verifiedRate, { sign: false, digits: 1 }),
  },
  {
    accessorKey: "wageProgressionRate",
    header: "Wage Prog %",
    cell: ({ row }) =>
      percent(row.original.wageProgressionRate, { sign: false, digits: 1 }),
  },
];
