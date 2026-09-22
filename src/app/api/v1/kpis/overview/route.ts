import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { createErrorResponse } from "../../_utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Total certified trainees
    const totalTrainees = await db.trainee.count({
      where: {
        enrolments: { some: {} },
      },
    });

    // Trainees with known outcome (not UNKNOWN)
    const traineesWithOutcome = await db.trainee.count({
      where: {
        outcomeEvents: { some: { outcomeStatus: { not: "UNKNOWN" } } },
      },
    });

    // Trainees with verified employment (EMPLOYER_CONFIRMED)
    const verifiedEmployed = await db.employmentClaim.count({
      where: { verificationStatus: "EMPLOYER_CONFIRMED" },
    });

    // Conflicts
    const conflicts = await db.employmentClaim.count({
      where: { verificationStatus: "CONFLICT" },
    });

    // Funnel data
    const certified = totalTrainees;
    const outcomeKnown = traineesWithOutcome;
    const employed = await db.employmentClaim.count({
      where: {
        verificationStatus: { in: ["SELF_REPORTED", "EMPLOYER_CONFIRMED"] },
        OR: [
          { employerName: { not: null } },
          { nonPlacementReason: { not: null } },
        ],
      },
    });
    const verified = verifiedEmployed;

    // Follow-up response rate
    const followupsSent = await db.followupEvent.count({ where: { status: "SENT" } });
    const followupsResponded = await db.followupEvent.count({ where: { status: "RESPONDED" } });

    // Recent activity timeline (latest events across all trainees)
    const [recentFollowups, recentClaims, recentVerifications] = await Promise.all([
      db.followupEvent.findMany({
        where: { status: { in: ["SENT", "RESPONDED"] } },
        include: { trainee: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.employmentClaim.findMany({
        include: { trainee: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.verificationRequest.findMany({
        where: { usedAt: { not: null } },
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