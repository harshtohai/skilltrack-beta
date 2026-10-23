function renderMagicLinkHtml(name: string, magicLink: string, otp: string, programme?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SkillsTrack</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Skilling Outcomes Platform</p>
        </div>

        <div style="background: #fefefe; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          ${programme ? `<p style="color: #4b5563; font-size: 14px;">You've been enrolled in <strong>${programme}</strong>.</p>` : ""}
          <p style="color: #4b5563; font-size: 16px;">We received a request to sign in to your SkillsTrack account. Click the button below to access your dashboard:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Sign In to SkillsTrack</a>
          </div>

          <p style="color: #4b5563; font-size: 14px; text-align: center; margin: 0 0 8px;">Or enter this code on <a href="${process.env.APP_BASE_URL}/auth/trainee" style="color: #3b82f6; text-decoration: underline;">the verification page</a>:</p>
          <div style="text-align: center; margin: 0 0 30px;">
            <span style="display: inline-block; font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #1f2937; background: #f3f4f6; padding: 14px 20px; border-radius: 8px;">${otp}</span>
          </div>

          <p style="color: #6b7280; font-size: 14px;">Or copy this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6; font-size: 13px; background: #f3f4f6; padding: 12px; border-radius: 6px;">${magicLink}</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This magic link expires in <strong>30 minutes</strong> and can only be used once.<br>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; padding: 0 20px;">
          <p style="color: #9ca3af; font-size: 12px;">© 2025 SkillsTrack. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export async function sendMagicLinkEmail(email: string, name: string, magicLink: string, otp: string, programme?: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[EMAIL-MOCK] Magic link sent to ${email}: ${magicLink} (OTP: ${otp})`);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "SkillsTrack", email: from },
      to: [{ email }],
      subject: "Your SkillsTrack Magic Link",
      htmlContent: renderMagicLinkHtml(name, magicLink, otp, programme),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Brevo error (${res.status}):`, body.slice(0, 300));
    throw new Error("Failed to send email");
  }
}

/* Email-change mails (T5): the OTP goes to the NEW address to verify it; the
 * after-change notice goes to the OLD address as a security heads-up. */

function renderEmailShell(bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SkillsTrack</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Skilling Outcomes Platform</p>
        </div>
        <div style="background: #fefefe; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
          ${bodyHtml}
        </div>
        <div style="text-align: center; margin-top: 20px; padding: 0 20px;">
          <p style="color: #9ca3af; font-size: 12px;">© 2025 SkillsTrack. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

/** Shared Brevo sender for the email-change mails (mock-logged by the callers
 * when Brevo env vars are missing, like sendMagicLinkEmail). */
async function sendBrevoEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY ?? "",
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "SkillsTrack", email: process.env.EMAIL_FROM ?? "" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Brevo error (${res.status}):`, body.slice(0, 300));
    throw new Error("Failed to send email");
  }
}

export async function sendEmailChangeOtpEmail(email: string, name: string, otp: string): Promise<void> {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    console.log(`[EMAIL-MOCK] Email-change code sent to ${email}: ${otp}`);
    return;
  }

  const html = renderEmailShell(`
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
    <p style="color: #4b5563; font-size: 16px;">Use this code to confirm your new SkillsTrack email address:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #1f2937; background: #f3f4f6; padding: 14px 20px; border-radius: 8px;">${otp}</span>
    </div>
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This code expires in <strong>30 minutes</strong> and can only be used once.<br>
      If you didn't request this, you can safely ignore this email — your current email stays unchanged.
    </p>
  `);
  await sendBrevoEmail(email, "Your SkillsTrack email-change code", html);
}

/**
 * Phone-change code — sent to the trainee's CURRENT email (not the new
 * number). Losing the phone is the classic reason to change it, so the
 * code must arrive on a channel the account already owns; the body names
 * the new number so the trainee knows what they are approving.
 */
export async function sendPhoneChangeOtpEmail(
  email: string,
  name: string,
  newPhoneMasked: string,
  otp: string,
): Promise<void> {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    console.log(`[EMAIL-MOCK] Phone-change code sent to ${email}: ${otp}`);
    return;
  }

  const html = renderEmailShell(`
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
    <p style="color: #4b5563; font-size: 16px;">Use this code to confirm your new SkillsTrack phone number (${newPhoneMasked}):</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #1f2937; background: #f3f4f6; padding: 14px 20px; border-radius: 8px;">${otp}</span>
    </div>
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This code expires in <strong>30 minutes</strong> and can only be used once.<br>
      If you didn't request this, you can safely ignore this email — your current number stays unchanged.
    </p>
  `);
  await sendBrevoEmail(email, "Your SkillsTrack phone-change code", html);
}

export async function sendEmailChangedNoticeEmail(oldEmail: string, name: string, newEmail: string): Promise<void> {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    console.log(`[EMAIL-MOCK] Email-changed notice sent to ${oldEmail} (new email: ${newEmail})`);
    return;
  }

  const html = renderEmailShell(`
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
    <p style="color: #4b5563; font-size: 16px;">Your SkillsTrack email was changed to <strong>${newEmail}</strong>. From now on, sign-in codes and updates go to the new address.</p>
    <p style="color: #4b5563; font-size: 16px;">If this wasn't you, contact your training center immediately.</p>
  `);
  await sendBrevoEmail(oldEmail, "Your SkillsTrack email was changed", html);
}

export async function sendCertificateRemovedNoticeEmail(
  email: string,
  name: string,
  certName: string,
  reason?: string | null,
): Promise<void> {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    console.log(`[EMAIL-MOCK] Certificate-removed notice sent to ${email} (certificate: ${certName})`);
    return;
  }

  const html = renderEmailShell(`
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
    <p style="color: #4b5563; font-size: 16px;">Your uploaded certificate <strong>${certName}</strong> was removed from your SkillsTrack profile${reason ? ` — reason: <strong>${reason}</strong>` : "."} You can re-upload a corrected version any time from your profile.</p>
    <p style="color: #4b5563; font-size: 16px;">If you have questions, contact your training center.</p>
  `);
  await sendBrevoEmail(email, "A certificate was removed from your SkillsTrack profile", html);
}
