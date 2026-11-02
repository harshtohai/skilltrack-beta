import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { auth } from "~/lib/auth";
import { routeErrorResponse, createErrorResponse, handleZodError } from "../../_utils";
import { maskPhoneE164 } from "~/lib/utils";

export const dynamic = "force-dynamic";

const lookupQuerySchema = z.object({ q: z.string().min(4).max(40) });

/**
 * Global trainee lookup for the add-trainee "has a SkillID" path (INST-04).
 * Deliberately NOT center-scoped — INST-01 governs enrolment writes, not
 * identity search: a SkillID is portable between centers, and the human
 * confirmation step is the guard. Accepts the TRN publicId or the trainee's
 * phone. The response flags which add-time fields are missing so the confirm
 * screen offers to fill exactly those.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse("UNAUTHORIZED", "Session required", 401);
    }
    const scope = await getSessionScope();
    if (scope.role !== "admin" && scope.role !== "institute") {
      return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
    }

    const { q } = lookupQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));

    // 10 digits (or 12 starting with 91) is a phone; anything else is a SkillID.
    const digits = q.replace(/\D/g, "");
    const isPhone = digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
    const trainee = isPhone
      ? await db.trainee.findUnique({
          where: { phoneE164: digits.length === 10 ? `+91${digits}` : `+${digits}` },
        })
      : await db.trainee.findFirst({
          where: { publicId: { equals: q.trim(), mode: "insensitive" } },
        });

    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "No trainee matches that SkillID or phone number", 404);
    }

    const enrolments = await db.enrolment.findMany({
      where: { traineeId: trainee.id },
      include: { cohort: { include: { programme: true, trainingCenter: true } } },
      orderBy: { createdAt: "desc" },
    });

    const missing = [
      ...(trainee.email ? [] : ["email"]),
      ...(trainee.dateOfBirth ? [] : ["dateOfBirth"]),
      ...(trainee.address ? [] : ["address"]),
      ...(trainee.educationLevel ? [] : ["educationLevel"]),
    ];

    return NextResponse.json({
      profile: {
        id: trainee.id,
        publicId: trainee.publicId,
        fullName: trainee.fullName,
        phoneMasked: maskPhoneE164(trainee.phoneE164),
        email: trainee.email,
        gender: trainee.gender,
        genderSelfDescribed: trainee.genderSelfDescribed,
        language: trainee.language,
        district: trainee.district,
        dateOfBirth: trainee.dateOfBirth,
        address: trainee.address,
        educationLevel: trainee.educationLevel,
        consentGiven: trainee.consentGiven,
      },
      enrolments: enrolments.map((e) => ({
        id: e.id,
        status: e.status,
        cohortName: e.cohort.name,
        programmeName: e.cohort.programme.name,
        centerName: e.cohort.trainingCenter?.name ?? "—",
        startDate: e.cohort.startDate,
        endDate: e.cohort.endDate,
      })),
      missing,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/trainees/lookup error:", error);
    return routeErrorResponse("Trainee lookup failed", error);
  }
}
