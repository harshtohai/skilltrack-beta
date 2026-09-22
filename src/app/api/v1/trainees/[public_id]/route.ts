import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse } from "../../_utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ public_id: string }> }
) {
  try {
    const { public_id } = await params;

    const trainee = await dbDirect.trainee.findUnique({
      where: { publicId: public_id },
      include: {
        enrolments: {
          include: { cohort: { include: { programme: true } } },
        },
      },
    });

    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    return NextResponse.json(trainee);
  } catch (error) {
    console.error("GET /api/v1/trainees/[public_id] error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch trainee", 500);
  }
}