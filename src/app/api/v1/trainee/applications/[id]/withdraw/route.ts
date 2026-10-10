import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { applicationIdParamSchema } from "~/lib/job-board-contracts";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Withdraw an application: own application only, allowed from APPLIED or
 * SHORTLISTED (HIRED/REJECTED/WITHDRAWN are final). Sets status WITHDRAWN;
 * the trainee can re-apply afterwards via the apply route.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const parsed = applicationIdParamSchema.safeParse({ id: (await params).id });
    if (!parsed.success) {
      return createErrorResponse("NOT_FOUND", "Application not found", 404);
    }
    const applicationId = parsed.data.id;

    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
    });
    if (application?.traineeId !== traineeId) {
      return createErrorResponse("NOT_FOUND", "Application not found", 404);
    }
    if (application.status !== "APPLIED" && application.status !== "SHORTLISTED") {
      return createErrorResponse(
        "WITHDRAW_NOT_ALLOWED",
        `Cannot withdraw from a ${application.status.toLowerCase()} application`,
        409
      );
    }

    const updated = await db.jobApplication.update({
      where: { id: application.id },
      data: { status: "WITHDRAWN" },
    });

    return NextResponse.json({
      application: { id: updated.id, status: updated.status },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/applications/[id]/withdraw error:", error);
    return routeErrorResponse("Failed to withdraw application", error);
  }
}
