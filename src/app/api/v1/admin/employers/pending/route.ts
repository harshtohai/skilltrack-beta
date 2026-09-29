import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { createErrorResponse } from "~/app/api/v1/_utils";
import { pendingEmployersResponseSchema } from "~/lib/job-board-contracts";

export const dynamic = "force-dynamic";

/** Admin verification queue: every employer awaiting a verify/reject decision. */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse("UNAUTHORIZED", "Admin session required", 401);
    }
    if (session.user.role !== "admin") {
      return createErrorResponse("FORBIDDEN", "Admin role required", 403);
    }

    const employers = await db.employer.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        contactEmail: true,
        sector: true,
        district: true,
        registrationNo: true,
        hiringNeeds: true,
        employeeCount: true,
        createdAt: true,
      },
    });

    const payload = pendingEmployersResponseSchema.parse({
      employers: employers.map((employer) => ({
        ...employer,
        createdAt: employer.createdAt.toISOString(),
      })),
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/v1/admin/employers/pending error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch pending employers", 500);
  }
}
