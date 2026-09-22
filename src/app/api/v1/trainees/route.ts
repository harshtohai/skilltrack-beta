import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "../_utils";
import { encryptPhone, hashPhone } from "~/lib/phone-encrypt";

export const dynamic = "force-dynamic";

const traineeCreateSchema = z.object({
  fullName: z.string().min(1),
  phoneE164: z.string().min(10),
  email: z.string().email().optional().nullable(),
  district: z.string().min(1),
  language: z.enum(["EN", "HI"]).default("EN"),
});

const traineeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cohortId: z.string().uuid().optional(),
  district: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = traineeListQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    if (query.cohortId) {
      where.enrolments = { some: { cohortId: query.cohortId } };
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
        ...data,
        phoneE164: normalizedPhone,
        phoneEncrypted,
        phoneHash,
        publicId: `TRN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      },
    });

    return NextResponse.json(trainee, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return handleZodError(error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return createErrorResponse("DUPLICATE_PHONE", "Phone number already exists", 409);
    }
    console.error("POST /api/v1/trainees error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to create trainee", 500);
  }
}