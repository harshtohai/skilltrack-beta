import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "~/server/db";
import { PageHeader } from "~/components/patterns/page-header";
import { TraineesTable } from "./trainees-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

/**
 * Trainees list per design §9.4 — Shell S1. Server component: the Prisma query
 * (search + pagination) stays server-side; the table renders through
 * trainees-table.tsx (client) so column renderers can cross the boundary.
 */
export default async function TraineesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = (q ?? "").trim();

  const traineeWhere = query
    ? {
        OR: [
          { publicId: { contains: query, mode: "insensitive" as const } },
          { fullName: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [trainees, total] = await Promise.all([
    db.trainee.findMany({
      where: traineeWhere,
      orderBy: { fullName: "asc" },
      select: { id: true, publicId: true, fullName: true, district: true, consentGiven: true },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.trainee.count({ where: traineeWhere }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => `/trainees?page=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <div>
      <PageHeader
        title="Trainees"
        caption={`${total.toLocaleString()} total — lookup by Trainee ID or name`}
      />

      <TraineesTable rows={trainees} query={query} />

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
