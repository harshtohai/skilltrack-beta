import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

const exportQuerySchema = z.object({
  cohortId: z.string().uuid(),
  format: z.enum(["csv", "json"]).default("json"),
});

export async function GET(request: NextRequest) {
  try {
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = exportQuerySchema.parse(Object.fromEntries(searchParams));

    const cohort = await db.cohort.findUnique({
      where: { id: query.cohortId },
      include: {
        programme: true,
        enrolments: {
          include: {
            trainee: {
              include: {
                employmentClaims: { include: { verificationRequests: true } },
                outcomeEvents: { where: { checkpointDays: { in: [30, 90] } } },
              },
            },
          },
        },
      },
    });

    if (!cohort) {
      return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
    }

    const trainees = cohort.enrolments.map((e) => {
      const t = e.trainee;
      const claim = t.employmentClaims[0];
      const outcome30 = t.outcomeEvents.find((o) => o.checkpointDays === 30);
      const outcome90 = t.outcomeEvents.find((o) => o.checkpointDays === 90);
      const verification = claim?.verificationRequests[0];

      return {
        traineeId: t.publicId,
        fullName: t.fullName,
        phone: t.phoneE164,
        email: t.email,
        district: t.district,
        language: t.language,
        certificationDate: e.certificationDate.toISOString().split("T")[0],
        employerName: claim?.employerName || "",
        role: claim?.role || "",
        salaryBand: claim?.salaryBand || "",
        claimVerificationStatus: claim?.verificationStatus || "NO_CLAIM",
        outcome30Status: outcome30?.outcomeStatus || "NO_DATA",
        outcome30Verification: outcome30?.verificationStatus || "NO_DATA",
        outcome90Status: outcome90?.outcomeStatus || "NO_DATA",
        outcome90Verification: outcome90?.verificationStatus || "NO_DATA",
        employerVerified: verification?.action === "CONFIRMED",
        employerRejectionReason: verification?.rejectionReason || "",
      };
    });

    if (query.format === "csv") {
      const headers = [
        "traineeId",
        "fullName",
        "phone",
        "email",
        "district",
        "language",
        "certificationDate",
        "employerName",
        "role",
        "salaryBand",
        "claimVerificationStatus",
        "outcome30Status",
        "outcome30Verification",
        "outcome90Status",
        "outcome90Verification",
        "employerVerified",
        "employerRejectionReason",
      ];

      const escapeCsv = (val: string) => {
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      };

      const rows = [headers.join(","), ...trainees.map((t) => headers.map((h) => escapeCsv(String(t[h as keyof typeof t] ?? ""))).join(","))];
      const csv = rows.join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sidh_export_${cohort.name}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      programme: { code: cohort.programme.code, name: cohort.programme.name },
      cohort: { name: cohort.name, startDate: cohort.startDate, endDate: cohort.endDate },
      exportedAt: new Date().toISOString(),
      trainees,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/sidh/export error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to export SIDH data", 500);
  }
}