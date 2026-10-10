import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { EmailSendError, mintAndSendLoginToken } from "~/server/magic-link";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const magicLinkSchema = z.object({
  email: z.string().email(),
  channel: z.enum(["EMAIL", "WHATSAPP"]).default("EMAIL"),
});

const RESEND_COOLDOWN_MS = 30 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const data = magicLinkSchema.parse(body);

    const trainee = await db.trainee.findFirst({
      where: { email: data.email.toLowerCase() },
    });

    if (!trainee) {
      return NextResponse.json({ success: true });
    }

    // Unverified enrollment: the link/OTP from the enrollment email is their
    // verification path — do NOT mint a login token yet. This reveals only
    // that an unverified enrollment exists (accepted trade-off for the block
    // message); unknown emails stay fully silent above.
    if (!trainee.consentGiven) {
      return NextResponse.json({ success: true, needsVerification: true });
    }

    // Server-side 30s cooldown so a double-click on "Resend link" cannot
    // mint extra tokens (§7 rate pattern). Unknown emails never reach here.
    const lastToken = await db.traineeLoginToken.findFirst({
      where: { traineeId: trainee.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastToken) {
      const retryAfter = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - lastToken.createdAt.getTime())) /
          1000,
      );
      if (retryAfter > 0) {
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMITED",
              message: `Too many requests. Try again in ${retryAfter}s.`,
              retryAfter,
            },
          },
          { status: 429 },
        );
      }
    }

    try {
      await mintAndSendLoginToken(trainee, data.channel);
    } catch (sendError) {
      if (sendError instanceof EmailSendError) {
        return createErrorResponse(
          "EMAIL_SEND_FAILED",
          "Couldn't send the email. Try again in a moment.",
          502,
        );
      }
      throw sendError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/magic-link error:", error);
    return routeErrorResponse("Failed to send magic link", error);
  }
}