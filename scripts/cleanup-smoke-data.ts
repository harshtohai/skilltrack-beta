/**
 * Removes smoke-test data created by scripts/verify-job-board.ts so the
 * demo database stays clean. Local dev and the Vercel deployment share the
 * same Supabase database, so one run covers both.
 *
 * Usage: npx tsx scripts/cleanup-smoke-data.ts
 *
 * Deletes (FK RESTRICT order):
 * - smoke employers (contactEmail smoke-*@company.com) and their
 *   applications + job postings
 * - the pinned test trainee's job-seek signals (only smoke runs create them)
 * - the test trainee's SmokeTest Corp employment history
 * - the test trainee's EMPLOYER-source outcome events (only smoke hires
 *   append those)
 *
 * Audit events are deliberately NOT deleted — audit logs are append-only.
 */
import { PrismaClient } from "@prisma/client";

const TRAINEE_ID = "622be85f-ac10-409b-b493-0c8e9592d75a"; // pinned test trainee

async function main() {
  const db = new PrismaClient();

  const smokeEmployers = await db.employer.findMany({
    where: { contactEmail: { startsWith: "smoke-", endsWith: "@company.com" } },
    select: { id: true, companyName: true },
  });
  const smokeEmployerIds = smokeEmployers.map((e) => e.id);

  // TechCorp (the seeded legit employer) also carries harness-created
  // postings — they only exist from smoke runs. Remove this clause if
  // TechCorp ever starts posting for real.
  const techcorp = await db.employer.findUnique({
    where: { contactEmail: "hr@company.com" },
    select: { id: true },
  });
  const harnessEmployerIds = techcorp ? [...smokeEmployerIds, techcorp.id] : smokeEmployerIds;

  // Every application by the pinned test trainee is smoke-created.
  const appsDeleted = await db.jobApplication.deleteMany({
    where: {
      OR: [
        { jobPosting: { employerId: { in: harnessEmployerIds } } },
        { traineeId: TRAINEE_ID },
      ],
    },
  });
  const postingsDeleted = await db.jobPosting.deleteMany({
    where: { employerId: { in: harnessEmployerIds } },
  });
  const employersDeleted = await db.employer.deleteMany({
    where: { id: { in: smokeEmployerIds } },
  });
  const signalsDeleted = await db.jobSeekSignal.deleteMany({
    where: { traineeId: TRAINEE_ID },
  });
  const historyDeleted = await db.employmentHistory.deleteMany({
    where: { traineeId: TRAINEE_ID, employer: "SmokeTest Corp" },
  });
  const outcomesDeleted = await db.outcomeEvent.deleteMany({
    where: { traineeId: TRAINEE_ID, source: "EMPLOYER" },
  });

  console.log(`✅ Cleanup complete:`);
  console.log(`   employers: ${employersDeleted.count} (${smokeEmployers.map((e) => e.companyName).join(", ") || "none"})`);
  console.log(`   job postings: ${postingsDeleted.count}`);
  console.log(`   job applications: ${appsDeleted.count}`);
  console.log(`   job seek signals: ${signalsDeleted.count}`);
  console.log(`   employment history: ${historyDeleted.count}`);
  console.log(`   outcome events (EMPLOYER-source): ${outcomesDeleted.count}`);
  console.log(`   audit events: untouched (append-only)`);

  await db.$disconnect();
}

main().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
