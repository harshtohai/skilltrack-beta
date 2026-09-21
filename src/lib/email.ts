export async function sendMagicLinkEmail(email: string, name: string, magicLink: string): Promise<void> {
  console.log(`[EMAIL] Magic link sent to ${email}: ${magicLink}`);
  // In production, integrate with SendGrid, AWS SES, or similar email service
  // const emailContent = `...` (HTML template)
  // await emailService.send({ to: email, subject: 'Your OutcomeTrack Magic Link', html: emailContent });
  return;
}