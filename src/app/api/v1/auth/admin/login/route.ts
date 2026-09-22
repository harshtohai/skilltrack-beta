import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@maharashtra.gov.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = adminLoginSchema.parse(body);

    if (data.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || data.password !== ADMIN_PASSWORD) {
      return createErrorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const user = {
      id: "admin-001",
      email: ADMIN_EMAIL,
      name: "Government Admin",
      role: "admin",
    };

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/auth/admin/login error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Login failed", 500);
  }
}