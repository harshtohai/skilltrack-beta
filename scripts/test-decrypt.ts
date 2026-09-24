import { PrismaClient } from "@prisma/client";
import { decryptPhone } from "../src/lib/phone-encrypt";

const prisma = new PrismaClient();

async function main() {
  const TEST_EMAIL = process.env.TEST_TRAINEE_EMAIL ?? "";
  if (!TEST_EMAIL) {
    console.log("Set TEST_TRAINEE_EMAIL in .env to run this script.");
    return;
  }

  // Find the test user
  const user = await prisma.trainee.findFirst({
    where: { email: TEST_EMAIL },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("Found user:", {
    id: user.id,
    name: user.fullName,
    phoneE164: user.phoneE164,
    phoneEncrypted: user.phoneEncrypted ? "exists" : "missing",
    phoneHash: user.phoneHash ? "exists" : "missing",
  });

  // Test decryption
  if (user.phoneEncrypted) {
    try {
      const decrypted = decryptPhone(user.phoneEncrypted);
      console.log("Decrypted phone:", decrypted);
    } catch (err) {
      console.error("Decryption failed:", err);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());