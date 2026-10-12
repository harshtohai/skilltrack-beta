// One-time backfill (ADR-002): every certificate that predates the two-source
// model was created by seed/backfill scripts acting as the institute, so they
// all become ISSUED + VERIFIED. Idempotent: guarded on reviewedAt IS NULL and
// a cutoff timestamp taken at script start, so certificates uploaded by real
// trainees after this script first runs are never touched.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cutoff = new Date();
  const result = await prisma.certificate.updateMany({
    where: { reviewedAt: null, source: "SELF_REPORTED", createdAt: { lt: cutoff } },
    data: { source: "ISSUED", status: "VERIFIED", reviewedAt: cutoff, reviewedBy: "seed-backfill" },
  });
  console.log(`✅ backfilled ${result.count} certificates → ISSUED/VERIFIED`);
  await prisma.$disconnect();
}

main();
