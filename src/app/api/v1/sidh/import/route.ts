import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";
import { parse } from "csv-parse/sync";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const sidhImportSchema = z.object({
  programmeCode: z.string(),
  cohortName: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  trainees: z.array(
    z.object({
      publicId: z.string().optional(),
      fullName: z.string(),
      phoneE164: z.string(),
      email: z.string().optional(),
      district: z.string(),
      language: z.enum(["EN", "HI"]).default("EN"),
    })
  ),
});

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
  if (cleaned.startsWith("91")) cleaned = cleaned.slice(2);
  if (!cleaned.startsWith("91")) cleaned = "91" + cleaned;
  return "+" + cleaned;
}

export async function POST(request: NextRequest) {
  try {
    if (!validateInternalApiKey(request)) {
      return createErrorResponse("UNAUTHORIZED", "Invalid API key", 401);
    }

    const contentType = request.headers.get("content-type") || "";
    let data: z.infer<typeof sidhImportSchema>;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const programmeCode = formData.get("programmeCode") as string;
      const cohortName = formData.get("cohortName") as string;
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;

      if (!file) return createErrorResponse("BAD_REQUEST", "No file uploaded", 400);

      const text = await file.text();
      const records = parse(text, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

      const trainees = records.map((r) => ({
        publicId: r.publicId || r.trainee_id,
        fullName: r.fullName || r.name || r.trainee_name || "",
        phoneE164: normalizePhone(r.phoneE164 || r.phone || r.mobile || ""),
        email: r.email,
        district: r.district || r.location || r.city || "",
        language: (r.language as "EN" | "HI") || "EN",
      }));

      data = { programmeCode, cohortName, startDate, endDate, trainees };
    } else if (contentType.includes("application/json")) {
      data = sidhImportSchema.parse(await request.json());
    } else {
      return createErrorResponse("UNSUPPORTED_MEDIA_TYPE", "Expected multipart/form-data or application/json", 415);
    }

    // Find or create programme
    let programme = await dbDirect.programme.findUnique({ where: { code: data.programmeCode } });
    if (!programme) {
      programme = await dbDirect.programme.create({
        data: { name: data.programmeCode, code: data.programmeCode },
      });
    }

    // Find or create cohort
    let cohort = await dbDirect.cohort.findFirst({
      where: { programmeId: programme.id, name: data.cohortName },
    });
    if (!cohort) {
      cohort = await dbDirect.cohort.create({
        data: {
          programmeId: programme.id,
          name: data.cohortName,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });
    }

    // Import trainees
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const trainee of data.trainees) {
      try {
        const phoneE164 = normalizePhone(trainee.phoneE164);
        const existing = await dbDirect.trainee.findUnique({ where: { phoneE164 } });

        if (existing) {
          await dbDirect.trainee.update({
            where: { id: existing.id },
            data: {
              fullName: trainee.fullName,
              email: trainee.email,
              district: trainee.district,
              language: trainee.language,
            },
          });
          // Ensure enrolment exists
          await dbDirect.enrolment.upsert({
            where: { traineeId_cohortId: { traineeId: existing.id, cohortId: cohort.id } },
            create: { traineeId: existing.id, cohortId: cohort.id, certificationDate: new Date(data.endDate) },
            update: {},
          });
          updated++;
        } else {
          const newTrainee = await dbDirect.trainee.create({
            data: {
              publicId: trainee.publicId || `TRN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              fullName: trainee.fullName,
              phoneE164,
              email: trainee.email,
              district: trainee.district,
              language: trainee.language,
              enrolments: {
                create: { cohortId: cohort.id, certificationDate: new Date(data.endDate) },
              },
            },
          });
          created++;
        }
      } catch (err) {
        errors.push(`Failed to import ${trainee.fullName}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      success: true,
      programme: { id: programme.id, code: programme.code },
      cohort: { id: cohort.id, name: cohort.name },
      stats: { created, updated, errors: errors.length },
      errors,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/sidh/import error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to import SIDH data", 500);
  }
}