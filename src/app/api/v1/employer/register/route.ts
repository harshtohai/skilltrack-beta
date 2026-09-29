import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "~/server/db";
import { employerRegisterResponseSchema, employerRegisterSchema } from "~/lib/job-board-contracts";
import { hashPassword } from "~/server/password-hash";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

/**
 * Employer signup (F25, unlisted): creates the Employers row with
 * verification_status PENDING. Login works immediately via the scrypt
 * credential; job posting unlocks once an admin verifies the account.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = employerRegisterSchema.parse(body);
    const contactEmail = data.contactEmail.trim().toLowerCase(); // login identity is lowercased

    const existing = await db.employer.findUnique({ where: { contactEmail } });
    if (existing) {
      return createErrorResponse("CONFLICT", "An employer with this email already exists", 409);
    }

    const employer = await db.employer.create({
      data: {
        companyName: data.companyName,
        contactEmail,
        passwordHash: hashPassword(data.password),
        sector: data.sector,
        district: data.district,
        registrationNo: data.registrationNo ?? null,
        hiringNeeds: data.hiringNeeds ?? null,
        employeeCount: data.employeeCount ?? null,
        verificationStatus: "PENDING",
      },
    });

    await db.auditEvent.create({
      data: {
        entityType: "Employer",
        entityId: employer.id,
        action: "EMPLOYER_REGISTER",
        actorType: "SYSTEM",
        metadata: { companyName: employer.companyName, contactEmail: employer.contactEmail },
      },
    });

    const response = employerRegisterResponseSchema.parse({
      employer: {
        id: employer.id,
        companyName: employer.companyName,
        contactEmail: employer.contactEmail,
        verificationStatus: employer.verificationStatus,
      },
    });
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    // Unique-constraint race between the check and the create.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return createErrorResponse("CONFLICT", "An employer with this email already exists", 409);
    }
    console.error("POST /api/v1/employer/register error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to register employer", 500);
  }
}
