import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const conflictsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  cohortId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = conflictsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {
      verificationStatus: "CONFLICT",
    };

    // We need to filter by cohort through the followupEvent
    const conflicts = await db.employmentClaim.findMany({
      where,
      include: {
        trainee: {
          select: { id: true, publicId: true, fullName: true, phoneE164: true, district: true },
        },
        followupEvent: {
          include: {
            cohort: { select: { id: true, name: true } },
          },
        },
        outcomeEvents: {
          where: { source: { in: ["TRAINEE", "EMPLOYER"] } },
          orderBy: { createdAt: "asc" },
        },
        verificationRequests: {
          where: { action: "REJECTED" },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by cohort if provided
    let filteredConflicts = conflicts;
    if (query.cohortId) {
      filteredConflicts = conflicts.filter((c) => c.followupEvent?.cohortId === query.cohortId);
    }

    // Paginate
    const start = (query.page - 1) * query.limit;
    const paginatedConflicts = filteredConflicts.slice(start, start + query.limit);

    // Transform to include both trainee and employer perspectives
    const conflictsWithSources = paginatedConflicts.map((claim) => {
      const traineeOutcome = claim.outcomeEvents.find((e) => e.source === "TRAINEE");
      const employerOutcome = claim.outcomeEvents.find((e) => e.source === "EMPLOYER");
      const rejection = claim.verificationRequests[0];

      return {
        id: claim.id,
        trainee: {
          id: claim.trainee.id,
          publicId: claim.trainee.publicId,
          fullName: claim.trainee.fullName,
          phoneE164: claim.trainee.phoneE164.replace(/(\+91)(\d{5})(\d{5})/, "$1 XXXXX $3"),
          district: claim.trainee.district,
        },
        cohort: claim.followupEvent?.cohort
          ? { id: claim.followupEvent.cohort.id, name: claim.followupEvent.cohort.name }
          : null,
        checkpointDays: claim.followupEvent?.checkpointDays,
        claim: {
          employerName: claim.employerName,
          role: claim.role,
          salaryBand: claim.salaryBand,
          nonPlacementReason: claim.nonPlacementReason,
          verificationStatus: claim.verificationStatus,
          evidenceLevel: claim.evidenceLevel,
          createdAt: claim.createdAt,
        },
        traineeSource: traineeOutcome
          ? {
              outcomeStatus: traineeOutcome.outcomeStatus,
              verificationStatus: traineeOutcome.verificationStatus,
              evidenceLevel: traineeOutcome.evidenceLevel,
              createdAt: traineeOutcome.createdAt,
            }
          : null,
        employerSource: employerOutcome
          ? {
              outcomeStatus: employerOutcome.outcomeStatus,
              verificationStatus: employerOutcome.verificationStatus,
              evidenceLevel: employerOutcome.evidenceLevel,
              rejectionReason: rejection?.rejectionReason,
              createdAt: employerOutcome.createdAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      data: conflictsWithSources,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: filteredConflicts.length,
        totalPages: Math.ceil(filteredConflicts.length / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/conflicts error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch conflicts", 500);
  }
}