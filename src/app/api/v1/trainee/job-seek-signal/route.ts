import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { jobSeekSignalSchema } from "~/lib/job-board-contracts";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Can't-find-a-job signal: the client only chooses a reason; the district
 * is taken from the trainee's profile server-side (reuses the
 * non_placement_reason enum).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const body = (await request.json()) as unknown;
    const data = jobSeekSignalSchema.parse(body);

    const trainee = await db.trainee.findUnique({
      where: { id: traineeId },
      select: { district: true },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    const signal = await db.jobSeekSignal.create({
      data: { traineeId, reason: data.reason, district: trainee.district },
    });

    return NextResponse.json(
      {
        signal: {
          id: signal.id,
          reason: signal.reason,
          district: signal.district,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/job-seek-signal error:", error);
    return routeErrorResponse("Failed to record signal", error);
  }
}
