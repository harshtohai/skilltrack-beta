import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { createErrorResponse } from "../../_utils";

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
    });
  } catch (error) {
    console.error("GET /api/v1/kpis/overview error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch KPIs", 500);
  }
}