import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { auth } from "~/lib/auth";
import { createErrorResponse, handleZodError } from "../_utils";
import { encryptPhone, hashPhone } from "~/lib/phone-encrypt";
import { mintAndSendLoginToken } from "~/server/magic-link";

export const dynamic = "force-dynamic";

const traineeCreateSchema = z.object({
  fullName: z.string().min(1),
  phoneE164: z.string().min(10),
  email: z.string().email().optional().nullable(),
  district: z.string().min(1),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "SELF_DESCRIBED", "PREFER_NOT_TO_SAY"]).default("PREFER_NOT_TO_SAY"),
  genderSelfDescribed: z.string().max(100).optional().nullable(),
  language: z.enum(["EN", "HI"]).default("EN"),
  consent: z.literal(true),
});

// INST-02 institute/admin add-trainee branch (body carries cohortId): adds
// cohort targeting. district is optional — it defaults to the cohort's
// center district server-side — and consent is NOT collected: institute-added
// trainees verify via the enrollment email instead (consentGiven stays false
// until then; the verify route flips it).
const instituteTraineeCreateSchema = traineeCreateSchema.extend({
  cohortId: z.string().uuid(),
  district: z.string().min(1).optional(),
  consent: z.literal(true).optional(),
});

/**
 * The enrolment target with just the relations the institute branch needs:
 * the programme name feeds the enrollment-email line, the center district
 * defaults into the trainee record, endDate seeds certificationDate.
 */
type EnrolmentTarget = {
  id: string;
  trainingCenterId: string | null;
  endDate: Date;
  programme: { name: string };
  trainingCenter: { district: string } | null;
};

const traineeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
  cohortId: z.string().uuid().optional(),
  district: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = traineeListQuerySchema.parse(Object.fromEntries(searchParams));
    const scope = await getSessionScope();

    const where: Record<string, unknown> = {};

    // INST-01: institutes see only trainees enrolled in their center's
    // cohorts; the cohortId filter (if any) merges into the same `some`.
    if (query.cohortId || scope.centerId) {
      where.enrolments = {
        some: {
          ...(query.cohortId ? { cohortId: query.cohortId } : {}),
          ...(scope.centerId ? { cohort: { trainingCenterId: scope.centerId } } : {}),
        },
      };
    }
    if (query.district) {
      where.district = query.district;
    }
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { publicId: { contains: query.search, mode: "insensitive" } },
        { phoneE164: { contains: query.search } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [trainees, total] = await Promise.all([
      db.trainee.findMany({
        where,
        // Simulator-scoped select (the only GET consumer — the dev-tool picker
        // uses exactly these 5 fields; perf #2): instead of the full row +
        // deep enrolment/cohort/programme includes that shipped every column
        // of 4 tables for up to 500 trainees. Also trims the PII surface
        // (phoneEncrypted/phoneHash/email never leave the server).
        select: {
          id: true,
          publicId: true,
          fullName: true,
          phoneE164: true,
          district: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      db.trainee.count({ where }),
    ]);

    return NextResponse.json({
      data: trainees,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/trainees error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch trainees", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const raw = (body ?? {}) as Record<string, unknown>;

    // INST-02: a cohortId in the body is the institute/admin add-trainee
    // branch. Session and scope are checked FIRST, so a public request can
    // never create an enrolment (no cohortId without a session → 401 first).
    const isEnrolmentAdd = typeof raw.cohortId === "string" && raw.cohortId !== "";
    let data: z.infer<typeof traineeCreateSchema> | z.infer<typeof instituteTraineeCreateSchema>;
    let cohort: EnrolmentTarget | null = null;
    if (isEnrolmentAdd) {
      const session = await auth();
      if (!session?.user?.id) {
        return createErrorResponse("UNAUTHORIZED", "Session required", 401);
      }
      const scope = await getSessionScope();
      if (scope.role !== "admin" && scope.role !== "institute") {
        return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
      }
      if (scope.role === "institute" && !scope.centerId) {
        return createErrorResponse("FORBIDDEN", "Institute center is not configured", 403);
      }
      data = instituteTraineeCreateSchema.parse(body);

      cohort = await db.cohort.findUnique({
        where: { id: data.cohortId },
        include: { programme: true, trainingCenter: true },
      });
      if (!cohort) {
        return createErrorResponse("NOT_FOUND", "Cohort not found", 404);
      }
      // INST-01: institute only adds into their own center's cohorts; admin
      // may target any center.
      if (scope.role === "institute" && cohort.trainingCenterId !== scope.centerId) {
        return createErrorResponse("FORBIDDEN", "The target cohort is not in your center", 403);
      }
    } else {
      // Public self-signup — unchanged path.
      data = traineeCreateSchema.parse(body);
    }

    const phoneE164 = data.phoneE164.replace(/\D/g, "");
    const normalizedPhone = phoneE164.length === 10 ? `+91${phoneE164}` : phoneE164.length === 12 ? `+${phoneE164}` : data.phoneE164;
    const phoneEncrypted = encryptPhone(normalizedPhone);
    const phoneHash = hashPhone(normalizedPhone);

    // Trainee + enrolment land together in the enrolment branch — the repo
    // pattern is an interactive transaction (see verification/hire routes).
    // certificationDate (required) defaults to the cohort's end date.
    // district: the signup form collects it (public path); the institute
    // branch defaults to the cohort's center district.
    const trainee = await db.$transaction(async (tx) => {
      const created = await tx.trainee.create({
        data: {
          fullName: data.fullName,
          email: data.email ?? null,
          phoneE164: normalizedPhone,
          phoneEncrypted,
          phoneHash,
          district: data.district ?? cohort?.trainingCenter?.district ?? "Unknown",
          language: data.language,
          gender: data.gender,
          // Self-described text only applies to SELF_DESCRIBED.
          genderSelfDescribed: data.gender === "SELF_DESCRIBED" ? (data.genderSelfDescribed?.trim() ?? null) : null,
          // Signup form collects consent (z.literal(true) above) — persist it.
          // Institute-added trainees haven't consented yet: they complete
          // consent by verifying via the enrollment email, so leave it false.
          consentGiven: !isEnrolmentAdd,
          consentGivenAt: isEnrolmentAdd ? null : new Date(),
          consentMethod: isEnrolmentAdd ? null : "SIGNUP_FORM",
          publicId: `TRN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        },
      });
      if (cohort) {
        await tx.enrolment.create({
          data: {
            traineeId: created.id,
            cohortId: cohort.id,
            status: "ACTIVE",
            certificationDate: cohort.endDate,
          },
        });
      }
      return created;
    });

    // Magic-link send via the shared helper — never duplicate the mint
    // logic. Public signup always sends (as before); the institute branch
    // skips it when there's no email to send to — that trainee simply has no
    // portal access until an email exists. A failed send (EmailSendError or
    // a DB hiccup while minting) is recovered by the sent page's resend, so
    // still return 201.
    if (!isEnrolmentAdd || trainee.email) {
      try {
        await mintAndSendLoginToken(
          { id: trainee.id, email: trainee.email, fullName: trainee.fullName },
          "EMAIL",
          cohort ? { programme: cohort.programme.name } : undefined,
        );
      } catch (sendError) {
        console.error("POST /api/v1/trainees: magic-link send failed:", sendError);
      }
    }

    return NextResponse.json(trainee, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return handleZodError(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Unique target tells email and phone duplicates apart (was mislabeled
      // DUPLICATE_PHONE for both). Target is the field name(s) as string or array.
      const target = error.meta?.target;
      const targetText = Array.isArray(target) ? target.join(" ") : typeof target === "string" ? target : "";
      if (targetText.includes("email")) {
        return createErrorResponse("EMAIL_EXISTS", "An account with this email already exists", 409);
      }
      return createErrorResponse("PHONE_EXISTS", "An account with this phone number already exists", 409);
    }
    console.error("POST /api/v1/trainees error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to create trainee", 500);
  }
}