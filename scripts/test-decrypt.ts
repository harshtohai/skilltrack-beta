import { PrismaClient } from "@prisma/client";
import { decryptPhone } from "../src/lib/phone-encrypt";

const prisma = new PrismaClient();

async function main() {
  // Find the test user
  const user = await prisma.trainee.findFirst({
    where: { email: "test.user@gmail.com" },
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