/**
 * Verifies the seeded demo data against the REAL aggregation code, so the
 * dashboard numbers are proven rather than assumed. Also reports DB size.
 * Run: npx tsx scripts/verify-seed-data.ts
 */
import { getMonthlyOutcomes, getTrainingCenterScores, getGroupedRates, getPeerBenchmarks } from "~/server/analytics";
import { aggregateDemandGaps, aggregateEmployerReliability } from "~/server/job-marketplace";
import { computeEmployerRetention, normalizeEmployerName } from "~/server/scoring";
import { db } from "~/server/db";
import { EMPLOYED_STATUSES } from "~/server/analytics";

function pct(n: number) {
  return `${n.toFixed(0)}%`;
}

async function main() {
  console.log("═══ 1. GOVERNMENT monthly outcomes (12m window) ═══");
  const { monthlyData, overall } = await getMonthlyOutcomes({ timeWindow: "12m", limit: 12 });
  console.log("month      cert  emp  ret90  verif  wageProg  place%  ret%   ver%   wage%");
  for (const m of monthlyData) {
    console.log(
      `${m.month.padEnd(9)} ${String(m.certified).padStart(4)} ${String(m.employed).padStart(4)} ${String(m.retained90).padStart(6)} ${String(m.verifiedEmployed).padStart(6)} ${String(m.wageProgression).padStart(8)}  ${pct(m.placementRate).padStart(6)} ${pct(m.retentionRate).padStart(5)} ${pct(m.verifiedRate).padStart(6)} ${pct(m.wageProgressionRate).padStart(6)}`,
    );
  }
  console.log(`OVERALL: certified=${overall.totalCertified} employed=${overall.totalEmployed} retained=${overall.totalRetained} verified=${overall.totalVerified}`);
  const totals = monthlyData.reduce(
    (a, m) => ({ c: a.c + m.certified, e: a.e + m.employed, r: a.r + m.retained90, v: a.v + m.verifiedEmployed, w: a.w + m.wageProgression }),
    { c: 0, e: 0, r: 0, v: 0, w: 0 },
  );
  console.log(`RATES:   placement=${pct((totals.e / totals.c) * 100)} (target 70) retention=${pct((totals.r / totals.e) * 100)} (60) verified=${pct((totals.v / totals.e) * 100)} (50) wageProg=${pct((totals.w / totals.e) * 100)} (30)`);

  console.log("\n═══ 2. 6m window (second time-window option) ═══");
  const six = await getMonthlyOutcomes({ timeWindow: "6m", limit: 6 });
  const s6 = six.monthlyData.reduce((a, m) => ({ c: a.c + m.certified, e: a.e + m.employed }), { c: 0, e: 0 });
  console.log(`6m: certified=${s6.c} employed=${s6.e} placement=${pct((s6.e / s6.c) * 100)}`);

  console.log("\n═══ 3. TRAINING AGENCY LEADERBOARD ═══");
  const centers = (await getTrainingCenterScores()).sort((a, b) => b.overallScore - a.overallScore);
  for (const c of centers) {
    console.log(
      `${c.centerName.padEnd(38)} overall=${String(c.overallScore).padStart(3)} place=${String(c.placementScore).padStart(3)} acad=${String(c.academicScore).padStart(3)} vol=${String(c.volumeScore).padStart(3)} | cert=${c.numerators.certifiedCount} known=${c.numerators.outcomesKnown} certs/trainee=${c.numerators.certificatesPerTrainee} relevance=${c.numerators.trainingRelevanceAvg}`,
    );
  }

  console.log("\n═══ 4. PEER BENCHMARKS (institute view) ═══");
  const peers = await getPeerBenchmarks();
  console.log(`centers=${peers.centerCount} avg: place=${pct(peers.avg.placementRate)} ret=${pct(peers.avg.retentionRate)} wage=${pct(peers.avg.wageProgressionRate)} certs=${peers.avg.certificatesPerTrainee.toFixed(1)}`);
  console.log(`          p75: place=${pct(peers.topQuartile.placementRate)} ret=${pct(peers.topQuartile.retentionRate)} wage=${pct(peers.topQuartile.wageProgressionRate)} certs=${peers.topQuartile.certificatesPerTrainee.toFixed(1)}`);
  const grouped = await getGroupedRates();
  const gaps = grouped.byCenter
    .map((c) => `${grouped.byCenter.find((x) => x.key === c.key)!.key.slice(0, 8)} place=${pct(c.placementRate)}`)
    .slice(0, 3);
  console.log(`per-center spread (first 3): ${gaps.join(" | ")}`);
  console.log(`cohorts tracked: ${grouped.byCohort.length}, cohort certified range: ${Math.min(...grouped.byCohort.map((c) => c.certifiedCount))}-${Math.max(...grouped.byCohort.map((c) => c.certifiedCount))}`);

  console.log("\n═══ 5. EMPLOYER VIEW (TechCorp) ═══");
  const allClaims = await db.employmentClaim.findMany({
    where: { employerName: { not: null } },
    select: { id: true, traineeId: true, employerName: true, salaryBand: true, verificationStatus: true, createdAt: true },
  });
  const outcomesAll = await db.outcomeEvent.findMany({ select: { traineeId: true, checkpointDays: true, outcomeStatus: true, createdAt: true } });
  const laterByTrainee = new Map<string, Array<{ checkpointDays: number; createdAt: Date; status: string }>>();
  for (const o of outcomesAll) {
    const arr = laterByTrainee.get(o.traineeId) ?? [];
    arr.push({ checkpointDays: o.checkpointDays, createdAt: o.createdAt, status: o.outcomeStatus });
    laterByTrainee.set(o.traineeId, arr);
  }
  const isEmployed = (s: string) => (EMPLOYED_STATUSES as readonly string[]).includes(s);

  // Per-employer groups exactly like /api/v1/employer/me
  const groups = new Map<string, typeof allClaims>();
  for (const c of allClaims) {
    const key = normalizeEmployerName(c.employerName!);
    const arr = groups.get(key) ?? [];
    arr.push(c);
    groups.set(key, arr);
  }
  const rankings: Array<{ name: string; score: number | null; n: number; num: number; den: number }> = [];
  for (const [name, claims] of groups) {
    const inputs = claims.map((c) => {
      const later = (laterByTrainee.get(c.traineeId) ?? [])
        .filter((o) => o.createdAt > c.createdAt && o.checkpointDays > 0)
        .sort((a, b) => a.checkpointDays - b.checkpointDays)[0];
      return {
        employerName: name,
        confirmed: c.verificationStatus === "EMPLOYER_CONFIRMED",
        sustainedEmployment: later ? isEmployed(later.status) : null,
      };
    });
    const r = computeEmployerRetention(inputs);
    rankings.push({ name, score: r.score, n: claims.length, num: r.numerator, den: r.denominator });
  }
  rankings.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  rankings.forEach((r, i) => {
    console.log(`#${i + 1} ${r.name.padEnd(22)} claims=${String(r.n).padStart(3)} retention=${r.score === null ? "—" : pct(r.score)} (${r.num}/${r.den})`);
  });
  const tech = rankings.find((r) => r.name === "TECHCORP")!;
  console.log(`TechCorp rank: #${rankings.findIndex((r) => r.name === "TECHCORP") + 1} of ${rankings.length} · peerAvg=${pct(rankings.filter((r) => r.name !== "TECHCORP").reduce((a, r) => a + (r.score ?? 0), 0) / (rankings.length - 1))}`);

  console.log("\n═══ 6. MARKETPLACE (government tab) ═══");
  const [jobsPosted, openJobs, applications, hires, signals, openByDistrict, allEmployers, boardHires] = await Promise.all([
    db.jobPosting.count(),
    db.jobPosting.count({ where: { status: "OPEN" } }),
    db.jobApplication.count(),
    db.jobApplication.count({ where: { status: "HIRED" } }),
    db.jobSeekSignal.findMany({ select: { district: true, reason: true } }),
    db.jobPosting.groupBy({ by: ["district"], where: { status: "OPEN" }, _count: { district: true } }),
    db.employer.findMany({ select: { id: true, companyName: true, verificationStatus: true } }),
    db.jobApplication.findMany({ where: { status: "HIRED" }, select: { traineeId: true, jobPosting: { select: { employerId: true } } } }),
  ]);
  const sustained = new Map<string, boolean>();
  for (const o of outcomesAll.filter((o) => o.checkpointDays > 0 && o.outcomeStatus !== "UNKNOWN").sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
    sustained.set(o.traineeId, isEmployed(o.outcomeStatus));
  }
  const namesById = new Map(allEmployers.map((e) => [e.id, e.companyName]));
  const verById = new Map(allEmployers.map((e) => [e.id, e.verificationStatus]));
  const claimsByEmp = new Map<string, Array<{ employerName: string; confirmed: boolean; sustainedEmployment: boolean | null }>>();
  const hiresByEmp: Record<string, number> = {};
  for (const h of boardHires) {
    const arr = claimsByEmp.get(h.jobPosting.employerId) ?? [];
    arr.push({ employerName: namesById.get(h.jobPosting.employerId) ?? "Unknown", confirmed: verById.get(h.jobPosting.employerId) === "VERIFIED", sustainedEmployment: sustained.get(h.traineeId) ?? null });
    claimsByEmp.set(h.jobPosting.employerId, arr);
    hiresByEmp[h.jobPosting.employerId] = (hiresByEmp[h.jobPosting.employerId] ?? 0) + 1;
  }
  const retScores: Record<string, number | null> = {};
  for (const [id, arr] of claimsByEmp) retScores[id] = computeEmployerRetention(arr).score;
  const demandGaps = aggregateDemandGaps(signals, Object.fromEntries(openByDistrict.map((r) => [r.district, r._count.district])));
  console.log(`jobs=${jobsPosted} open=${openJobs} applications=${applications} hires=${hires} hireRate=${pct((hires / applications) * 100)}`);
  console.log(`demand gaps (top 5): ${demandGaps.slice(0, 5).map((d) => `${d.district} ${d.signals}signals/${d.openJobs}jobs(${d.byReason[0]?.reason})`).join(" | ")}`);
  for (const e of aggregateEmployerReliability(allEmployers, hiresByEmp, retScores)) {
    console.log(`  ${e.companyName.padEnd(24)} ${e.verificationStatus.padEnd(8)} hires=${String(e.hires).padStart(2)} retention=${e.retentionScore === null ? "—" : pct(e.retentionScore)}${e.flagged ? "  ⚠ FLAGGED" : ""}`);
  }

  console.log("\n═══ 7. KPI FUNNEL (shared dashboard) ═══");
  const [totalTrainees, traineesWithOutcome, conflictClaims, verifiedClaims] = await Promise.all([
    db.trainee.count({ where: { enrolments: { some: {} } } }),
    db.trainee.count({ where: { outcomeEvents: { some: { outcomeStatus: { not: "UNKNOWN" } } } } }),
    db.employmentClaim.count({ where: { verificationStatus: "CONFLICT" } }),
    db.employmentClaim.count({ where: { verificationStatus: "EMPLOYER_CONFIRMED" } }),
  ]);
  console.log(`totalTrainees=${totalTrainees} outcomeKnown=${traineesWithOutcome} (${pct((traineesWithOutcome / totalTrainees) * 100)}) verifiedClaims=${verifiedClaims} conflicts=${conflictClaims}`);

  console.log("\n═══ 8. SIZE ═══");
  const rows = await db.$queryRawUnsafe<Array<{ relname: string; size: string }>>(
    `SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) as size FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT 12`,
  );
  for (const r of rows) console.log(`  ${r.relname.padEnd(24)} ${r.size}`);
  const dbSize = await db.$queryRawUnsafe<Array<{ size: string }>>(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
  const totalRows = await db.$queryRawUnsafe<Array<{ n: number }>>(
    `SELECT (SELECT count(*) FROM trainees) + (SELECT count(*) FROM enrolments) + (SELECT count(*) FROM outcome_events) + (SELECT count(*) FROM employment_claims) + (SELECT count(*) FROM followup_events) + (SELECT count(*) FROM certificates) as n`,
  );
  console.log(`DATABASE TOTAL: ${dbSize[0]?.size ?? "?"} · core rows=${totalRows[0]?.n ?? "?"} (Supabase free tier = 500 MB)`);

  console.log("\n═══ 9. DEMO LOGINS & SEED STATE ═══");
  // Logins validate against verificationRequests/employers (no user model in
  // Prisma) — verify-job-board.ts exercises the real HTTP login flows.
  const techcorp = await db.employer.findFirst({ where: { companyName: "TechCorp" }, select: { companyName: true, verificationStatus: true, contactEmail: true } });
  console.log(`  TechCorp: ${techcorp?.verificationStatus} (${techcorp?.contactEmail})`);
  const demoTrainee = await db.trainee.findFirst({ where: { id: "622be85f-ac10-409b-b493-0c8e9592d75a" }, select: { fullName: true, district: true } });
  console.log(`  Demo trainee (magic-link): ${demoTrainee?.fullName ?? "MISSING"} (${demoTrainee?.district ?? "?"})`);
  const [auditCount] = await db.$queryRawUnsafe<Array<{ n: number }>>(`SELECT count(*) as n FROM audit_events`);
  console.log(`  Audit events preserved: ${auditCount?.n ?? 0}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
