const KAPSO_API_KEY = process.env.KAPSO_API_KEY;
const KAPSO_PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID;
const KAPSO_BASE_URL = "https://api.kapso.ai/meta/whatsapp/v24.0";

if (!KAPSO_API_KEY || !KAPSO_PHONE_NUMBER_ID) {
  console.warn("[KAPSO] Missing KAPSO_API_KEY or KAPSO_PHONE_NUMBER_ID in env");
}

export interface KapsoSendOptions {
  toPhoneE164: string;
  text: string;
  options?: Array<{ label: string; value: string; description?: string }>;
  addCareerGuidance?: boolean;
}

export interface KapsoSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface KapsoApiResponse {
  data?: { id?: string };
  error?: { message?: string };
}

function formatPhoneForKapso(phoneE164: string): string {
  return phoneE164.replace("+", "").replace(" ", "");
}

function buildButtonMessage(to: string, text: string, options: Array<{ label: string; value: string }>) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text },
      action: {
        buttons: options.slice(0, 3).map((opt) => ({
          type: "reply",
          reply: { id: opt.value, title: opt.label.substring(0, 20) },
        })),
      },
    },
  };
}

function buildListMessage(to: string, text: string, options: Array<{ label: string; value: string; description?: string }>) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text },
      action: {
        button: "View Options",
        sections: [{
          title: "Options",
          rows: options.slice(0, 10).map((opt) => ({
            id: opt.value,
            title: opt.label.substring(0, 24),
            description: opt.description?.substring(0, 72) ?? "",
          })),
        }],
      },
    },
  };
}

function buildTextMessage(to: string, text: string) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };
}

async function postToKapso(payload: object): Promise<KapsoSendResult> {
  try {
    const response = await fetch(`${KAPSO_BASE_URL}/${KAPSO_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "X-API-Key": KAPSO_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as KapsoApiResponse;

    if (!response.ok) {
      console.error("[KAPSO] Send error:", result);
      return { success: false, error: result.error?.message ?? "Failed to send" };
    }
    return { success: true, messageId: result.data?.id };
  } catch (err) {
    console.error("[KAPSO] Network error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function sendKapsoMessage(opts: KapsoSendOptions): Promise<KapsoSendResult[]> {
  if (!KAPSO_API_KEY || !KAPSO_PHONE_NUMBER_ID) {
    return [{ success: false, error: "Kapso not configured" }];
  }

  const to = formatPhoneForKapso(opts.toPhoneE164);
  if (!to.startsWith("91")) {
    return [{ success: false, error: "Only Indian numbers (+91) supported" }];
  }

  const payloads: object[] = [];

  if (opts.options && opts.options.length > 0) {
    if (opts.options.length <= 3) {
      payloads.push(buildButtonMessage(to, opts.text, opts.options));
    } else {
      payloads.push(buildListMessage(to, opts.text, opts.options));
    }
  } else {
    payloads.push(buildTextMessage(to, opts.text));
  }

  if (opts.addCareerGuidance) {
    payloads.push(buildTextMessage(to,
      "💡 *Career Tip:* For personalized job matching, skill development resources, and career guidance, visit *OutcomeTrack* – our platform helps you track progress, find opportunities, and build a stronger professional profile. Check it out! 🚀\n\nhttps://outcometrack.vercel.app"
    ));
  }

  const results: KapsoSendResult[] = [];
  for (const payload of payloads) {
    results.push(await postToKapso(payload));
  }
  return results;
}

export async function sendKapsoTemplate(
  templateName: string,
  toPhoneE164: string,
  languageCode: string,
  components: object[]
): Promise<KapsoSendResult> {
  if (!KAPSO_API_KEY || !KAPSO_PHONE_NUMBER_ID) {
    return { success: false, error: "Kapso not configured" };
  }

  const to = formatPhoneForKapso(toPhoneE164);
  return postToKapso({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}