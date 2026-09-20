import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import Papa from "papaparse";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError, normalizePhoneE164 } from "../../_utils";

const importRowSchema = z.object({
  full_name: z.string().min(1),
  phone_e164: z.string().min(10),
  email: z.string().email().optional().nullable(),
  district: z.string().min(1),
  language: z.enum(["EN", "HI"]).default("EN"),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createErrorResponse("NO_FILE", "CSV file is required", 400);
    }

    const text = await file.text();
    const parseResult = Papa.parse(text, { header: true, skipEmptyLines: true });

    if (parseResult.errors.length > 0) {
      return createErrorResponse("CSV_PARSE_ERROR", parseResult.errors.map((e) => e.message).join("; "), 400);
    }

    const rows = parseResult.data as Record<string, string>[];
    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const [index, row] of rows.entries()) {
      try {
        const validated = importRowSchema.parse(row);
        const phoneE164 = normalizePhoneE164(validated.phone_e164);

        const existing = await db.trainee.findUnique({ where: { phoneE164 } });
        if (existing) {
          results.skipped++;
          results.errors.push(`Row ${index + 1}: Phone ${validated.phone_e164} already exists`);
          continue;
        }

        await db.trainee.create({
          data: {
            fullName: validated.full_name,
            phoneE164,
            email: validated.email ?? null,
            district: validated.district,
            language: validated.language,
            publicId: `TRN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          },
        });
        results.created++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          results.errors.push(`Row ${index + 1}: ${error.errors.map((e) => e.message).join("; ")}`);
        } else {
          results.errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainees/import error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to import trainees", 500);
  }
}