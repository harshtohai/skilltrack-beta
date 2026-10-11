import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { PageHeader } from "~/components/patterns/page-header";
import { TraineesTable, type TraineeListRow } from "./trainees-table";

export const dynamic = "force-dynamic";

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
  searchParams: Promise<{ page?: string; q?: string; status?: string; view?: string; perPage?: string }>;
}) {
  const { page, q, status, view: rawView, perPage: rawPerPage } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = (q ?? "").trim();
  const tab = parseLifecycleTab(status);
  const view = rawView === "grid" ? "grid" : "list";
  // §4.5 page-size choices; anything else falls back to the default.
  const perPage = [10, 25, 50].includes(Number(rawPerPage)) ? Number(rawPerPage) : 25;
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
      skip: (currentPage - 1) * perPage,
      take: perPage,
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

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const buildHref = (
    params: Record<string, string>,
    overrides?: { view?: string; perPage?: number },
  ) => {
    const search = new URLSearchParams(params);
    if (query) search.set("q", query);
    const v = overrides?.view ?? view;
    if (v !== "list") search.set("view", v);
    const pp = overrides?.perPage ?? perPage;
    if (pp !== 25) search.set("perPage", String(pp));
    return `/trainees?${search.toString()}`;
  };
  const pageHref = (p: number) => buildHref({ page: String(p), status: tab });
  const tabHref = (value: LifecycleTab) => buildHref({ status: value });
  const perPageHref = (n: number) => buildHref({ status: tab, page: String(currentPage) }, { perPage: n });

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

      <TraineesTable rows={rows} query={query} status={tab} total={total} view={view} perPage={perPage} />

      {/* Server-side pagination (§4.5 footer pattern — page numbers max 5) */}
      <div className="mt-4 flex items-center justify-between text-caption text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <span aria-hidden className="text-border">
            |
          </span>
          <span>Per page</span>
          <div className="flex items-center gap-2">
            {[10, 25, 50].map((n) => (
              <Link
                key={n}
                href={perPageHref(n)}
                aria-label={`${n} rows per page`}
                aria-current={n === perPage ? "true" : undefined}
                className={`tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${
                  n === perPage ? "font-medium text-foreground" : "hover:text-foreground"
                }`}
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1)}
              aria-label="Previous page"
              className="inline-flex size-11 lg:size-8 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : null}
          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1)}
              aria-label="Next page"
              className="inline-flex size-11 lg:size-8 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
