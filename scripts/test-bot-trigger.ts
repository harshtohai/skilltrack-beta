import { PrismaClient } from "@prisma/client";
import { sendKapsoMessage } from "../src/lib/bot/kapso";

const prisma = new PrismaClient();

async function main() {
  // Find the test user
  const user = await prisma.trainee.findFirst({
    where: { phoneE164: "+0000000000" },
    include: { enrolments: { include: { cohort: { include: { programme: true } } } } },
  });

  if (!user) {
    console.log("Test user +0000000000 not found. Creating...");
    
    // Create the test user
    const newUser = await prisma.trainee.create({
      data: {
        fullName: "Test User",
        phoneE164: "+0000000000",
        phoneEncrypted: "", // Will be filled by encryptPhone
        phoneHash: "",
        email: "test.user@gmail.com",
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
    toPhoneE164: "+0000000000",
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