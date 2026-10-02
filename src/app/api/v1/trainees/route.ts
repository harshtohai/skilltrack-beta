import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
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
        include: {
          enrolments: {
            include: { cohort: { include: { programme: true } } },
          },
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
    const data = traineeCreateSchema.parse(body);

    const phoneE164 = data.phoneE164.replace(/\D/g, "");
    const normalizedPhone = phoneE164.length === 10 ? `+91${phoneE164}` : phoneE164.length === 12 ? `+${phoneE164}` : data.phoneE164;
    const phoneEncrypted = encryptPhone(normalizedPhone);
    const phoneHash = hashPhone(normalizedPhone);

    const trainee = await db.trainee.create({
      data: {
        fullName: data.fullName,
        email: data.email ?? null,
        phoneE164: normalizedPhone,
        phoneEncrypted,
        phoneHash,
        district: data.district,
        language: data.language,
        gender: data.gender,
        // Self-described text only applies to SELF_DESCRIBED.
        genderSelfDescribed: data.gender === "SELF_DESCRIBED" ? (data.genderSelfDescribed?.trim() ?? null) : null,
        // Signup form collects consent (z.literal(true) above) — persist it.
        consentGiven: true,
        consentGivenAt: new Date(),
        consentMethod: "SIGNUP_FORM",
        publicId: `TRN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      },
    });

    // First magic-link send via the shared helper — never duplicate the mint
    // logic. The trainee exists either way: a failed send (EmailSendError or
    // a DB hiccup while minting) is recovered by the sent page's resend, so
    // still return 201.
    try {
      await mintAndSendLoginToken(
        { id: trainee.id, email: trainee.email, fullName: trainee.fullName },
        "EMAIL",
      );
    } catch (sendError) {
      console.error("POST /api/v1/trainees: magic-link send failed:", sendError);
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