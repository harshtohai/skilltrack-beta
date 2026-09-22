import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

const instituteLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = instituteLoginSchema.parse(body);

    const programme = await db.programme.findFirst({
      where: {
        OR: [
          { code: { equals: data.email.split("@")[0], mode: "insensitive" } },
        ],
      },
    });

    if (!programme) {
      return createErrorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const user = {
      id: programme.id,
      email: data.email,
      name: programme.name,
      role: "institute",
      instituteId: programme.id,
    };

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/auth/institute/login error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Login failed", 500);
  }
}