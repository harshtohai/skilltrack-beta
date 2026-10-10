import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { employerIdParamSchema, verifyEmployerSchema } from "~/lib/job-board-contracts";

export const dynamic = "force-dynamic";

/**
 * Admin verify/reject: moves a PENDING employer to VERIFIED (can post
 * jobs immediately) or REJECTED. Audit-logged with the full decision.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse("UNAUTHORIZED", "Admin session required", 401);
    }
    if (session.user.role !== "admin") {
      return createErrorResponse("FORBIDDEN", "Admin role required", 403);
    }

    const { id } = await params;
    employerIdParamSchema.parse({ id });

    const body = (await request.json()) as unknown;
    const data = verifyEmployerSchema.parse(body);

    const employer = await db.employer.findUnique({ where: { id } });
    if (!employer) {
      return createErrorResponse("NOT_FOUND", "Employer not found", 404);
    }
    if (employer.verificationStatus !== "PENDING") {
      return createErrorResponse(
        "CONFLICT",
        `Employer is already ${employer.verificationStatus.toLowerCase()} — only pending employers can be decided`,
        409
      );
    }

    const updated = await db.employer.update({
      where: { id },
      data: { verificationStatus: data.decision },
      select: { id: true, companyName: true, verificationStatus: true },
    });

    await db.auditEvent.create({
      data: {
        entityType: "Employer",
        entityId: id,
        action: "VERIFY_EMPLOYER",
        actorType: "ADMIN",
        actorId: session.user.id,
        metadata: { decision: data.decision, companyName: updated.companyName },
      },
    });

    return NextResponse.json({
      employer: {
        id: updated.id,
        companyName: updated.companyName,
        verificationStatus: updated.verificationStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/admin/employers/[id]/verify error:", error);
    return routeErrorResponse("Failed to verify employer", error);
  }
}
