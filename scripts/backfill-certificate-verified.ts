// One-time backfill (ADR-003, supersedes ADR-002): the manual review model is
// removed — certificates are provenance-labelled, not hand-validated. Any
// PENDING/REJECTED rows from the brief review era become VERIFIED with the
// rejection cleared. Idempotent (guarded on status != VERIFIED).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.certificate.updateMany({
    where: { status: { not: "VERIFIED" } },
    data: { status: "VERIFIED", rejectionReason: null },
  });
  console.log(`✅ backfilled ${result.count} certificates → VERIFIED (review model removed)`);
  await prisma.$disconnect();
}

main();
