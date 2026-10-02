import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { PageHeader } from "~/components/patterns/page-header";
import { TraineesTable, type TraineeListRow } from "./trainees-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

/**
 * Lifecycle tabs (INST-03): the default view is Active; "all" lists every
 * status. Values map straight onto the EnrolmentStatus enum.
 */
const LIFECYCLE_TABS = [
  { value: "all", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DROPPED_OUT", label: "Dropped out" },
  { value: "COMPLETED", label: "Completed" },
] as const;

type LifecycleTab = (typeof LIFECYCLE_TABS)[number]["value"];

function parseLifecycleTab(raw: string | undefined): LifecycleTab {
  return LIFECYCLE_TABS.some((t) => t.value === raw) ? (raw as LifecycleTab) : "ACTIVE";
}

/** ACTIVE > COMPLETED > DROPPED_OUT; null when the trainee has no enrolments. */
function lifecycleStatus(statuses: string[]): TraineeListRow["lifecycleStatus"] {
  if (statuses.includes("ACTIVE")) return "ACTIVE";
  if (statuses.includes("COMPLETED")) return "COMPLETED";
  return statuses.length > 0 ? "DROPPED_OUT" : null;
}

/**
 * Trainees list per design §9.4 — Shell S1. Server component: the Prisma query
 * (search + pagination) stays server-side; the table renders through
 * trainees-table.tsx (client) so column renderers can cross the boundary.
 */
export default async function TraineesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const { page, q, status } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = (q ?? "").trim();
  const tab = parseLifecycleTab(status);
  // "all" lists every status; the other tabs filter by EnrolmentStatus.
  const statusFilter = tab === "all" ? null : tab;
  const scope = await getSessionScope();

  // INST-01: institutes see only trainees enrolled in their center's cohorts.
  // INST-03: the lifecycle tab merges into the same `some`.
  const centreFilter =
    scope.centerId || statusFilter
      ? {
          enrolments: {
            some: {
              ...(statusFilter ? { status: statusFilter } : {}),
              ...(scope.centerId ? { cohort: { trainingCenterId: scope.centerId } } : {}),
            },
          },
        }
      : {};

  const traineeWhere = {
    ...(query
      ? {
          OR: [
            { publicId: { contains: query, mode: "insensitive" as const } },
            { fullName: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...centreFilter,
  };

  const [trainees, total] = await Promise.all([
    db.trainee.findMany({
      where: traineeWhere,
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        publicId: true,
        fullName: true,
        district: true,
        consentGiven: true,
        enrolments: { select: { status: true } },
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.trainee.count({ where: traineeWhere }),
  ]);

  const rows: TraineeListRow[] = trainees.map((t) => ({
    id: t.id,
    publicId: t.publicId,
    fullName: t.fullName,
    district: t.district,
    consentGiven: t.consentGiven,
    lifecycleStatus: lifecycleStatus(t.enrolments.map((e) => e.status)),
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (params: Record<string, string>) => {
    const search = new URLSearchParams(params);
    if (query) search.set("q", query);
    return `/trainees?${search.toString()}`;
  };
  const pageHref = (p: number) => buildHref({ page: String(p), status: tab });
  const tabHref = (value: LifecycleTab) => buildHref({ status: value });

  return (
    <div>
      <PageHeader
        title="Trainees"
        caption={`${total.toLocaleString()} total — lookup by Trainee ID or name`}
      />

      {/* Lifecycle tabs (§9.4/§4.6 line style) */}
      <div className="mb-4 flex h-10 items-center gap-1 overflow-x-auto border-b text-muted-foreground">
        {LIFECYCLE_TABS.map((t) => {
          const active = t.value === tab;
          return (
            <Link
              key={t.value}
              href={tabHref(t.value)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-10 shrink-0 items-center whitespace-nowrap border-b-2 px-3 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${
                active ? "border-primary text-foreground" : "border-transparent hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <TraineesTable rows={rows} query={query} status={tab} />

      {/* Server-side pagination (§4.5 footer pattern — page numbers max 5) */}
      <div className="mt-4 flex items-center justify-between text-caption text-muted-foreground">
        <span className="tabular-nums">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1)}
              aria-label="Previous page"
              className="inline-flex size-8 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : null}
          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1)}
              aria-label="Next page"
              className="inline-flex size-8 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
