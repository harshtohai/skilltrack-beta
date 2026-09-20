import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

const followupsQuerySchema = z.object({
  status: z.enum(["SCHEDULED", "SENT", "RESPONDED", "FAILED", "EXPIRED"]).optional(),
  checkpointDays: z.coerce.number().int().positive().optional(),
  cohortId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = followupsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    if (query.status) where.status = query.status;
    if (query.checkpointDays) where.checkpointDays = query.checkpointDays;
    if (query.cohortId) where.cohortId = query.cohortId;

    const [followups, total] = await Promise.all([
      db.followupEvent.findMany({
        where,
        include: {
          trainee: { select: { id: true, publicId: true, fullName: true, phoneE164: true, district: true } },
          cohort: { select: { id: true, name: true } },
          botSessions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      db.followupEvent.count({ where }),
    ]);

    return NextResponse.json({
      data: followups,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/followups error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch follow-ups", 500);
  }
}