import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { employerIdParamSchema, suspendEmployerSchema } from "~/lib/job-board-contracts";

export const dynamic = "force-dynamic";

/**
 * Admin suspend: revokes a VERIFIED employer's badge — their jobs become
 * hidden from trainees (the trainee-side query filters SUSPENDED).
 * Audit-logged with the optional reason.
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
    const data = suspendEmployerSchema.parse(body);

    const employer = await db.employer.findUnique({ where: { id } });
    if (!employer) {
      return createErrorResponse("NOT_FOUND", "Employer not found", 404);
    }
    if (employer.verificationStatus !== "VERIFIED") {
      return createErrorResponse(
        "CONFLICT",
        `Employer is ${employer.verificationStatus.toLowerCase()} — only verified employers can be suspended`,
        409
      );
    }

    const updated = await db.employer.update({
      where: { id },
      data: { verificationStatus: "SUSPENDED" },
      select: { id: true, companyName: true, verificationStatus: true },
    });

    const metadata: { companyName: string; reason?: string } = { companyName: updated.companyName };
    if (data.reason !== undefined) metadata.reason = data.reason;

    await db.auditEvent.create({
      data: {
        entityType: "Employer",
        entityId: id,
        action: "SUSPEND_EMPLOYER",
        actorType: "ADMIN",
        actorId: session.user.id,
        metadata,
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
    console.error("POST /api/v1/admin/employers/[id]/suspend error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to suspend employer", 500);
  }
}
