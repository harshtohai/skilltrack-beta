import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbDirect } from "~/server/db-direct";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const employerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = employerLoginSchema.parse(body);

    const verificationRequest = await dbDirect.verificationRequest.findFirst({
      where: {
        employmentClaim: {
          employerName: { contains: data.email.split("@")[0], mode: "insensitive" },
        },
      },
      include: {
        employmentClaim: true,
      },
    });

    if (!verificationRequest || !verificationRequest.employmentClaim) {
      return createErrorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const user = {
      id: `employer-${verificationRequest.employmentClaimId}`,
      email: data.email,
      name: verificationRequest.employmentClaim.employerName ?? "Employer",
      role: "employer",
      employerId: verificationRequest.employmentClaimId,
    };

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/auth/employer/login error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Login failed", 500);
  }
}