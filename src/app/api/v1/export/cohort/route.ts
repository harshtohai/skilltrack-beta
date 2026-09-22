import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const exportQuerySchema = z.object({
  cohortId: z.string().uuid(),
  format: z.enum(["csv", "json"]).default("csv"),
});

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function generateCsv(headers: string[], rows: string[][]): string {
  const headerRow = headers.map(escapeCsv).join(",");
  const dataRows = rows.map((row) => row.map(escapeCsv).join(","));
  return [headerRow, ...dataRows].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = exportQuerySchema.parse(Object.fromEntries(searchParams));

    const cohort = await dbDirect.cohort.findUnique({
      where: { id: query.cohortId },
      include: { programme: true },
    });

    if (!cohort) {
      return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
    }

    // Get all trainees in this cohort with their latest outcomes
    const trainees = await dbDirect.trainee.findMany({
      where: { enrolments: { some: { cohortId: query.cohortId } } },
      include: {
        enrolments: {
          where: { cohortId: query.cohortId },
          include: { cohort: { include: { programme: true } } },
        },
        employmentClaims: {
          include: {
            followupEvent: true,
            verificationRequests: true,
          },
          orderBy: { createdAt: "desc" },
        },
        outcomeEvents: {
          where: { checkpointDays: { in: [30, 90] } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const headers = [
      "trainee_public_id",
      "trainee_full_name",
      "trainee_phone_e164",
      "trainee_district",
      "trainee_language",
      "cohort_name",
      "programme_name",
      "certification_date",
      "latest_claim_verification_status",
      "latest_claim_employer_name",
      "latest_claim_role",
      "latest_claim_salary_band",
      "latest_claim_evidence_level",
      "outcome_30_day_status",
      "outcome_30_day_verification_status",
      "outcome_30_day_evidence_level",
      "outcome_90_day_status",
      "outcome_90_day_verification_status",
      "outcome_90_day_evidence_level",
      "retention_90_day",
    ];

    const rows = trainees.map((trainee) => {
      const enrolment = trainee.enrolments[0];
      const latestClaim = trainee.employmentClaims[0];
      const outcome30 = trainee.outcomeEvents.find((e) => e.checkpointDays === 30);
      const outcome90 = trainee.outcomeEvents.find((e) => e.checkpointDays === 90);
      const verification = latestClaim?.verificationRequests[0];

      // Calculate retention at 90 days
      let retention90 = "N/A";
      if (outcome30 && outcome90) {
        const employed30 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome30.outcomeStatus);
        const employed90 = ["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"].includes(outcome90.outcomeStatus);
        if (employed30) {
          retention90 = employed90 ? "Retained" : "Not Retained";
        } else {
          retention90 = "Not Employed at 30";
        }
      }

      return [
        trainee.publicId,
        trainee.fullName,
        trainee.phoneE164,
        trainee.district,
        trainee.language,
        cohort.name,
        cohort.programme.name,
        enrolment?.certificationDate?.toISOString().split("T")[0] ?? "",
        latestClaim?.verificationStatus ?? "NO_CLAIM",
        latestClaim?.employerName ?? "",
        latestClaim?.role ?? "",
        latestClaim?.salaryBand ?? "",
        String(latestClaim?.evidenceLevel ?? 0),
        outcome30?.outcomeStatus ?? "NO_DATA",
        outcome30?.verificationStatus ?? "NO_DATA",
        String(outcome30?.evidenceLevel ?? 0),
        outcome90?.outcomeStatus ?? "NO_DATA",
        outcome90?.verificationStatus ?? "NO_DATA",
        String(outcome90?.evidenceLevel ?? 0),
        retention90,
      ];
    });

    if (query.format === "json") {
      return NextResponse.json({
        cohort: { id: cohort.id, name: cohort.name, programme: cohort.programme.name },
        exportedAt: new Date().toISOString(),
        totalTrainees: trainees.length,
        data: rows.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]]))),
      });
    }

    const csv = generateCsv(headers, rows);
    const filename = `cohort_${cohort.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/export/cohort error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to export cohort data", 500);
  }
}