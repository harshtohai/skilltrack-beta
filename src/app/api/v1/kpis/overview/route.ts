import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse } from "../../_utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // INST-04: institutes see only their center's numbers, filtered through
    // cohorts (same center claim as the trainees route); admin stays unscoped.
    // Claims and followups reach the center via the trainee's enrolments.
    const scope = await getSessionScope();
    const centerFilter = scope.centerId
      ? { cohort: { trainingCenterId: scope.centerId } }
      : null;
    const viaTrainee = centerFilter
      ? { trainee: { enrolments: { some: centerFilter } } }
      : {};

    // Total certified trainees
    const totalTrainees = await db.trainee.count({
      where: {
        enrolments: { some: centerFilter ?? {} },
      },
    });

    // Trainees with known outcome (not UNKNOWN)
    const traineesWithOutcome = await db.trainee.count({
      where: {
        ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
        outcomeEvents: { some: { outcomeStatus: { not: "UNKNOWN" } } },
      },
    });

    // Trainees with verified employment (EMPLOYER_CONFIRMED) — trainee-based so
    // the funnel and the placement rate stay consistent with the certified and
    // outcome-known counts (a trainee with several claims must not count twice;
    // claim-based counts made the rate exceed 100%).
    const verifiedEmployed = await db.trainee.count({
      where: {
        employmentClaims: { some: { verificationStatus: "EMPLOYER_CONFIRMED" } },
        ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
      },
    });

    // Conflicts
    const conflicts = await db.employmentClaim.count({
      where: { verificationStatus: "CONFLICT", ...viaTrainee },
    });

    // Funnel data
    const certified = totalTrainees;
    const outcomeKnown = traineesWithOutcome;
    // Employed = trainees with at least one substantive claim (same unit as the
    // certified/outcome-known funnel stages).
    const employed = await db.trainee.count({
      where: {
        employmentClaims: {
          some: {
            verificationStatus: { in: ["SELF_REPORTED", "EMPLOYER_CONFIRMED"] },
            OR: [
              { employerName: { not: null } },
              { nonPlacementReason: { not: null } },
            ],
          },
        },
        ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
      },
    });
    const verified = verifiedEmployed;

    // Follow-up response rate
    const followupsSent = await db.followupEvent.count({
      where: { status: "SENT", ...viaTrainee },
    });
    const followupsResponded = await db.followupEvent.count({
      where: { status: "RESPONDED", ...viaTrainee },
    });

    // Recent activity timeline (latest events across the scoped trainees)
    const [recentFollowups, recentClaims, recentVerifications] = await Promise.all([
      db.followupEvent.findMany({
        where: { status: { in: ["SENT", "RESPONDED"] }, ...viaTrainee },
        include: { trainee: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.employmentClaim.findMany({
        where: viaTrainee,
        include: { trainee: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.verificationRequest.findMany({
        where: {
          usedAt: { not: null },
          ...(centerFilter
            ? { employmentClaim: { trainee: { enrolments: { some: centerFilter } } } }
            : {}),
        },
        include: { employmentClaim: { include: { trainee: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const recentActivity = [
      ...recentFollowups.map((f) => ({
        type: "FOLLOWUP" as const,
        date: (f.sentAt ?? f.createdAt).toISOString(),
        title: `${f.checkpointDays}-day follow-up ${f.status === "RESPONDED" ? "responded" : "sent"}`,
        traineeName: f.trainee.fullName,
        traineePublicId: f.trainee.publicId,
      })),
      ...recentClaims.map((c) => ({
        type: "CLAIM" as const,
        date: c.createdAt.toISOString(),
        title: `Employment claim (${c.verificationStatus.toLowerCase().replace(/_/g, " ")})`,
        traineeName: c.trainee.fullName,
        traineePublicId: c.trainee.publicId,
      })),
      ...recentVerifications.map((v) => ({
        type: "VERIFICATION" as const,
        date: (v.usedAt ?? v.createdAt).toISOString(),
        title: `Employer ${v.action?.toLowerCase() ?? "pending"}`,
        traineeName: v.employmentClaim?.trainee.fullName ?? "Unknown",
        traineePublicId: v.employmentClaim?.trainee.publicId,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    return NextResponse.json({
      trainees: {
        total: totalTrainees,
        numerator: totalTrainees,
        denominator: totalTrainees,
      },
      outcomeCoverage: {
        rate: totalTrainees > 0 ? Math.round((traineesWithOutcome / totalTrainees) * 100) : 0,
        numerator: traineesWithOutcome,
        denominator: totalTrainees,
      },
      verifiedEmployment: {
        rate: outcomeKnown > 0 ? Math.round((verifiedEmployed / outcomeKnown) * 100) : 0,
        numerator: verifiedEmployed,
        denominator: outcomeKnown,
      },
      conflicts: {
        count: conflicts,
      },
      funnel: {
        certified: { count: certified, label: "Certified" },
        outcomeKnown: { count: outcomeKnown, label: "Outcome Known" },
        employed: { count: employed, label: "Employed" },
        verified: { count: verified, label: "Verified" },
      },
      followupResponseRate: {
        rate: followupsSent > 0 ? Math.round((followupsResponded / followupsSent) * 100) : 0,
        numerator: followupsResponded,
        denominator: followupsSent,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("GET /api/v1/kpis/overview error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch KPIs", 500);
  }
}