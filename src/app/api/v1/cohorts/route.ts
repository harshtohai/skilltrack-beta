import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { routeErrorResponse, handleZodError } from "../_utils";

export const dynamic = "force-dynamic";

const cohortQuerySchema = z.object({
  programmeId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = cohortQuerySchema.parse(Object.fromEntries(searchParams));

    const where = query.programmeId ? { programmeId: query.programmeId } : {};

    const cohorts = await db.cohort.findMany({
      where,
      include: {
        programme: true,
        _count: { select: { enrolments: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({
      data: cohorts.map((c) => ({
        ...c,
        traineeCount: c._count.enrolments,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/cohorts error:", error);
    return routeErrorResponse("Failed to fetch cohorts", error);
  }
}