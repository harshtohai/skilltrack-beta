import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError } from "../../_utils";

export const dynamic = "force-dynamic";

const cohortDetailQuerySchema = z.object({
  district: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const query = cohortDetailQuerySchema.parse(Object.fromEntries(searchParams));

    const cohort = await dbDirect.cohort.findUnique({
      where: { id },
      include: {
        programme: true,
        enrolments: {
          include: { trainee: true },
        },
      },
    });

    if (!cohort) {
      return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
    }

    const traineeIds = cohort.enrolments.map((e) => e.traineeId);
    const followups = await dbDirect.followupEvent.findMany({
      where: { traineeId: { in: traineeIds }, checkpointDays: 30 },
    });

    const followupMap = new Map<string, { id: string; traineeId: string; cohortId: string; checkpointDays: number; status: string; channel: string; sentAt: Date | null; respondedAt: Date | null }>(followups.map((f) => [f.traineeId, f]));

    let trainees = cohort.enrolments.map((e) => ({
      ...e.trainee,
      followupStatus: followupMap.get(e.traineeId)?.status ?? null,
    }));

    if (query.district) {
      trainees = trainees.filter((t) => t.district === query.district);
    }

    const total = trainees.length;
    const paginated = trainees.slice((query.page - 1) * query.limit, query.page * query.limit);

    return NextResponse.json({
      cohort: {
        id: cohort.id,
        name: cohort.name,
        programme: cohort.programme,
        startDate: cohort.startDate,
        endDate: cohort.endDate,
      },
      trainees: paginated,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/cohorts/[id] error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch cohort", 500);
  }
}