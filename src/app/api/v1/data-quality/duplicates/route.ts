import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError, validateInternalApiKey } from "~/app/api/v1/_utils";

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const duplicateQuerySchema = z.object({
  cohortId: z.string().uuid().optional(),
  threshold: z.coerce.number().min(0).max(1).default(0.8),
});

function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshtein(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
function levenshtein(a: string, b: string): number {
  const matrix: any = Array.from({ length: b.length + 1 }, () => Array(a.length + 1).fill(0));
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = duplicateQuerySchema.parse(Object.fromEntries(searchParams));

    const cohortFilter = query.cohortId ? { cohortId: query.cohortId } : {};

    const trainees = await db.trainee.findMany({
      where: { enrolments: { some: cohortFilter } },
      select: { id: true, publicId: true, fullName: true, phoneE164: true, district: true },
    });

    const duplicates: Array<{
      trainee1: { id: string; publicId: string; fullName: string; phoneE164: string; district: string };
      trainee2: { id: string; publicId: string; fullName: string; phoneE164: string; district: string };
      nameSimilarity: number;
      districtMatch: boolean;
      phoneMatch: boolean;
      riskLevel: "HIGH" | "MEDIUM" | "LOW";
    }> = [];

    const getTrainee = (arr: typeof trainees, idx: number) => arr[idx]!;
    for (let i = 0; i < trainees.length; i++) {
      for (let j = i + 1; j < trainees.length; j++) {
        const t1 = getTrainee(trainees, i);
        const t2 = getTrainee(trainees, j);

        const nameSim = similarity(t1.fullName, t2.fullName);
        const districtMatch = t1.district === t2.district;
        const phoneMatch = t1.phoneE164 === t2.phoneE164;

        let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
        if (phoneMatch || (nameSim > 0.9 && districtMatch)) riskLevel = "HIGH";
        else if (nameSim > query.threshold && districtMatch) riskLevel = "MEDIUM";
        else if (nameSim > query.threshold) riskLevel = "LOW";

        if (riskLevel !== "LOW" || nameSim > query.threshold) {
          duplicates.push({
            trainee1: { id: t1.id, publicId: t1.publicId, fullName: t1.fullName, phoneE164: t1.phoneE164, district: t1.district },
            trainee2: { id: t2.id, publicId: t2.publicId, fullName: t2.fullName, phoneE164: t2.phoneE164, district: t2.district },
            nameSimilarity: Math.round(nameSim * 10000) / 100,
            districtMatch,
            phoneMatch,
            riskLevel,
          });
        }
      }
    }

    // Sort by risk level and similarity
    const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    duplicates.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel] || b.nameSimilarity - a.nameSimilarity);

    return NextResponse.json({
      data: duplicates,
      total: duplicates.length,
      highRisk: duplicates.filter((d) => d.riskLevel === "HIGH").length,
      mediumRisk: duplicates.filter((d) => d.riskLevel === "MEDIUM").length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/data-quality/duplicates error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to detect duplicates", 500);
  }
}