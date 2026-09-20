import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { db } from "~/server/db";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export function createErrorResponse(code: string, message: string, status: number): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function handleZodError(error: ZodError): NextResponse<ApiErrorResponse> {
  const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
  return createErrorResponse("VALIDATION_ERROR", messages, 400);
}

export function validateInternalApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("X-API-Key");
  const expectedKey = process.env.INTERNAL_API_KEY;
  return apiKey === expectedKey && expectedKey !== undefined;
}

export async function getTraineeByPhone(phoneE164: string) {
  return db.trainee.findUnique({
    where: { phoneE164 },
    include: {
      enrolments: {
        include: { cohort: true },
      },
    },
  });
}

export function normalizePhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }
  return phone;
}