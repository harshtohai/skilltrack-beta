import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(email: string, name: string, magicLink: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL-MOCK] Magic link sent to ${email}: ${magicLink}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    to: email,
    subject: "Your OutcomeTrack Magic Link",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">OutcomeTrack</h1>
            <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Skilling Outcomes Platform</p>
          </div>
          
          <div style="background: #fefefe; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
            <p style="color: #4b5563; font-size: 16px;">We received a request to sign in to your OutcomeTrack account. Click the button below to access your dashboard:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Sign In to OutcomeTrack</a>
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
            <p style="color: #9ca3af; font-size: 12px;">© 2025 OutcomeTrack. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send email");
  }
}