import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export function createErrorResponse(code: string, message: string, status: number): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: { code, message } }, { status });
}

// Prisma connection-outage codes (perf #4): P1001 can't-reach, P1002 timed-out,
// P2024 pool timeout. The message fallback also catches transient socket
// failures that surface without a code.
export function isDbOutage(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (code === "P1001" || code === "P1002" || code === "P2024") return true;
  return error instanceof Error && error.message.includes("Can't reach database server");
}

// Route catch handler: a DB outage is a transient infra failure, not a bug —
// it returns 503 SERVICE_UNAVAILABLE (the retryable code) with Retry-After so
// monitoring distinguishes it from real bugs and clients retry gracefully.
// Everything else keeps the existing 500 INTERNAL_ERROR semantics.
export function routeErrorResponse(message: string, error: unknown): NextResponse<ApiErrorResponse> {
  if (isDbOutage(error)) {
    return NextResponse.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Database temporarily unavailable — retry shortly" } },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }
  return createErrorResponse("INTERNAL_ERROR", message, 500);
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