import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse } from "../../../_utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ public_id: string }> }
) {
  try {
    const { public_id } = await params;

    const trainee = await dbDirect.trainee.findUnique({
      where: { publicId: public_id },
      select: { id: true },
    });

    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    const [enrolments, followups, claims, verifications] = await Promise.all([
      dbDirect.enrolment.findMany({
        where: { traineeId: trainee.id },
        include: { cohort: { include: { programme: true } } },
        orderBy: { certificationDate: "asc" },
      }),
      dbDirect.followupEvent.findMany({
        where: { traineeId: trainee.id },
        orderBy: { checkpointDays: "asc" },
      }),
      dbDirect.employmentClaim.findMany({
        where: { traineeId: trainee.id },
        include: { followupEvent: true, verificationRequests: true },
        orderBy: { createdAt: "asc" },
      }),
      dbDirect.verificationRequest.findMany({
        where: { employmentClaim: { traineeId: trainee.id } },
        include: { employmentClaim: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const events = [
      ...enrolments.map((e) => ({
        type: "CERTIFICATION" as const,
        date: e.certificationDate,
        title: `Certified: ${e.cohort.programme.name} - ${e.cohort.name}`,
        description: `Completed training in ${e.cohort.programme.code}`,
        metadata: { cohortId: e.cohortId, programmeId: e.cohort.programmeId },
      })),
      ...followups.map((f) => ({
        type: "FOLLOWUP" as const,
        date: f.sentAt ?? f.createdAt,
        title: `${f.checkpointDays}-day follow-up`,
        description: `Status: ${f.status}`,
        metadata: { followupId: f.id, checkpointDays: f.checkpointDays, status: f.status },
      })),
      ...claims.map((c) => ({
        type: "CLAIM" as const,
        date: c.createdAt,
        title: "Employment claim submitted",
        description: `${c.verificationStatus} • ${c.employerName ?? "N/A"} • ${c.role ?? "N/A"} • ${c.salaryBand ?? "N/A"}`,
        metadata: {
          claimId: c.id,
          verificationStatus: c.verificationStatus,
          evidenceLevel: c.evidenceLevel,
          employerName: c.employerName,
          role: c.role,
          salaryBand: c.salaryBand,
        },
      })),
      ...verifications.map((v) => ({
        type: "VERIFICATION" as const,
        date: v.usedAt ?? v.createdAt,
        title: `Employer ${v.action?.toLowerCase() ?? "pending"}`,
        description: v.rejectionReason ?? "Verified by employer",
        metadata: {
          verificationId: v.id,
          action: v.action,
          claimId: v.employmentClaimId,
        },
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET /api/v1/trainees/[public_id]/timeline error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch timeline", 500);
  }
}