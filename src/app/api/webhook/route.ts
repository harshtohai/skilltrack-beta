import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { processInboundMessage } from "~/lib/bot/conversation";

const KAPSO_VERIFY_TOKEN = process.env.KAPSO_VERIFY_TOKEN ?? "outcometrack-webhook-verify-2024";
const KAPSO_WEBHOOK_SECRET = process.env.KAPSO_WEBHOOK_SECRET;

const kapsoWebhookPayloadSchema = z.object({
  message: z.object({
    id: z.string(),
    from: z.string(),
    timestamp: z.string(),
    type: z.string(),
    text: z.object({ body: z.string().optional() }).optional(),
    interactive: z
      .object({
        type: z.string(),
        button_reply: z.object({ id: z.string() }).optional(),
        list_reply: z.object({ id: z.string() }).optional(),
      })
      .optional(),
  }),
  conversation: z.object({ id: z.string().optional(), contact_name: z.string().optional() }).optional(),
  phone_number_id: z.string().optional(),
});

function verifySignature(req: NextRequest, rawBody: string): boolean {
  if (!KAPSO_WEBHOOK_SECRET) return true;
  const signature = req.headers.get("x-kapso-signature") ?? req.headers.get("x-hub-signature-256");
  if (!signature) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", KAPSO_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return signature === expected;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");

  if (mode === "subscribe" && verifyToken === KAPSO_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verifySignature(req, rawBody)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const body: unknown = JSON.parse(rawBody);

    // Kapso may batch events; process each individually, never fail on one bad item
    const items = extractPayloads(body);
    for (const item of items) {
      const parsed = kapsoWebhookPayloadSchema.safeParse(item);
      if (!parsed.success) {
        console.error("[WEBHOOK] Invalid payload:", parsed.error.message);
        continue;
      }
      await processInboundMessage(toInboundMessage(parsed.data));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[WEBHOOK] Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

interface KapsoEnvelope {
  batch?: unknown;
  data?: unknown;
}

function extractPayloads(body: unknown): unknown[] {
  const envelope = body as KapsoEnvelope;
  if (envelope.batch && Array.isArray(envelope.data)) {
    return envelope.data;
  }
  return [body];
}

function toInboundMessage(payload: z.infer<typeof kapsoWebhookPayloadSchema>) {
  const fromPhone = formatPhoneE164(payload.message.from);
  const contactName = payload.conversation?.contact_name ?? "there";
  const isInteractive = payload.message.type === "interactive";

  let text = "";
  if (isInteractive) {
    text =
      payload.message.interactive?.type === "button_reply"
        ? payload.message.interactive.button_reply?.id ?? ""
        : payload.message.interactive?.list_reply?.id ?? "";
  } else {
    text = payload.message.text?.body?.trim() ?? "";
  }

  return {
    fromPhone,
    contactName,
    text,
    kapsoMessageId: payload.message.id,
    kapsoConversationId: payload.conversation?.id,
    kapsoPhoneNumberId: payload.phone_number_id,
    timestamp: new Date(parseInt(payload.message.timestamp) * 1000).toISOString(),
    isInteractive,
  };
}

function formatPhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (!cleaned.startsWith("+")) return `+${cleaned}`;
  return phone;
}