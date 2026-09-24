import { PrismaClient } from "@prisma/client";
import { sendKapsoMessage } from "../src/lib/bot/kapso";

const prisma = new PrismaClient();

// Test trainee credentials — read from env, never hardcoded (personal
// data must not be committed).
const TEST_PHONE = process.env.TEST_TRAINEE_PHONE ?? "";
const TEST_NAME = process.env.TEST_TRAINEE_NAME ?? "Test User";
const TEST_EMAIL = process.env.TEST_TRAINEE_EMAIL ?? "";

async function main() {
  if (!TEST_PHONE) {
    console.log("Set TEST_TRAINEE_PHONE (and optionally TEST_TRAINEE_NAME/EMAIL) in .env to run this script.");
    return;
  }

  // Find the test user
  const user = await prisma.trainee.findFirst({
    where: { phoneE164: TEST_PHONE },
    include: { enrolments: { include: { cohort: { include: { programme: true } } } } },
  });

  if (!user) {
    console.log("Test user not found. Creating...");

    // Create the test user
    const newUser = await prisma.trainee.create({
      data: {
        fullName: TEST_NAME,
        phoneE164: TEST_PHONE,
        phoneEncrypted: "", // Will be filled by encryptPhone
        phoneHash: "",
        email: TEST_EMAIL || null,
        district: "Mumbai",
        language: "EN",
        consentGiven: false,
      }
    });
    console.log("Created test user:", newUser.id);
    return;
  }

  console.log("Found test user:", {
    id: user.id,
    name: user.fullName,
    phone: user.phoneE164,
    email: user.email,
    programme: user.enrolments[0]?.cohort?.programme?.name,
    cohort: user.enrolments[0]?.cohort?.name,
  });

  // Send the welcome message to start the conversation
  const result = await sendKapsoMessage({
    toPhoneE164: TEST_PHONE,
    text: `👋 *Hello ${user.fullName}!*

Welcome to *OutcomeTrack* – the official placement tracking & career guidance platform by *Maharashtra State Skill Development Society (MSSDS)* under the *Pradhan Mantri Kaushal Vikas Yojana (PMKVY)*.

We're here to understand your career journey after training so we can:
✅ Improve training programs for future batches
✅ Connect you with better job opportunities  
✅ Provide personalized career guidance
✅ Help policymakers make data-driven decisions

*Your responses are confidential and used only for program improvement.*

Shall we begin? It takes about 3-4 minutes.`,
    options: [
      { label: "✅ Yes, I consent", value: "consent_yes" },
      { label: "❌ No, thank you", value: "consent_no" },
    ],
  });

  console.log("Send result:", result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());