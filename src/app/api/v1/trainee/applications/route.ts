import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * My applications: all of the calling trainee's applications, newest first.
 * Contact reveal is symmetric — the employer's email appears once the
 * application is SHORTLISTED and stays revealed for HIRED.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const applications = await db.jobApplication.findMany({
      where: { traineeId },
      orderBy: { createdAt: "desc" },
      include: {
        jobPosting: {
          include: { employer: { select: { companyName: true, contactEmail: true } } },
        },
      },
    });

    return NextResponse.json({
      applications: applications.map((app) => ({
        id: app.id,
        jobPostingId: app.jobPostingId,
        jobTitle: app.jobPosting.title,
        companyName: app.jobPosting.employer.companyName,
        district: app.jobPosting.district,
        status: app.status,
        appliedAt: app.createdAt.toISOString(),
        employerContactEmail:
          app.status === "SHORTLISTED" || app.status === "HIRED"
            ? app.jobPosting.employer.contactEmail
            : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/trainee/applications error:", error);
    return routeErrorResponse("Failed to fetch applications", error);
  }
}
