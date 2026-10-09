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

    // Parallelized counts — run all 7 independent COUNT queries concurrently
    // to avoid the sequential DB round-trip storm that causes 6.5–8.3s warm
    // latency and 24s+ during pooler flakiness.
    const [
      totalTraineesResult,
      traineesWithOutcomeResult,
      verifiedEmployedResult,
      conflictsResult,
      employedResult,
      followupsSentResult,
      followupsRespondedResult,
    ] = await Promise.all([
      db.trainee.count({
        where: {
          enrolments: { some: centerFilter ?? {} },
        },
      }),
      db.trainee.count({
        where: {
          ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
          outcomeEvents: { some: { outcomeStatus: { not: "UNKNOWN" } } },
        },
      }),
      db.trainee.count({
        where: {
          employmentClaims: { some: { verificationStatus: "EMPLOYER_CONFIRMED" } },
          ...(centerFilter ? { enrolments: { some: centerFilter } } : {}),
        },
      }),
      db.employmentClaim.count({
        where: { verificationStatus: "CONFLICT", ...viaTrainee },
      }),
      db.trainee.count({
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
      }),
      // Follow-up response rate — denominator counts followups EVER sent
      // (SENT, RESPONDED, FAILED, EXPIRED), not just those currently in the
      // SENT state: a RESPONDED followup was sent first (SCHEDULED → SENT →
      // RESPONDED), so counting only status === "SENT" undercounted the
      // denominator and produced an impossible 903% response rate.
      db.followupEvent.count({
        where: { status: { in: ["SENT", "RESPONDED", "FAILED", "EXPIRED"] }, ...viaTrainee },
      }),
      db.followupEvent.count({
        where: { status: "RESPONDED", ...viaTrainee },
      }),
    ]);

    const totalTrainees = totalTraineesResult;
    const traineesWithOutcome = traineesWithOutcomeResult;
    const verifiedEmployed = verifiedEmployedResult;
    const conflicts = conflictsResult;
    const employed = employedResult;
    const followupsSent = followupsSentResult;
    const followupsResponded = followupsRespondedResult;

    // Funnel aliases (same units as the stages above)
    const certified = totalTrainees;
    const outcomeKnown = traineesWithOutcome;
    const verified = verifiedEmployed;

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