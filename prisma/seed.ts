/**
 * Demo seed — chart-accurate and compact.
 *
 * Design constraints (derived from the aggregation code, not guesses):
 *  - getMonthlyOutcomes buckets enrolments by certification month and only
 *    counts a 30d/90d OutcomeEvent when its createdAt falls INSIDE that same
 *    month, so both events are dated certDate + 4d / + 10d.
 *  - Wage progression needs TWO claims per employed trainee (30d band < 90d band).
 *  - Employer dashboards group claims by normalized employerName, so claims
 *    must name the seeded Employer companies.
 *  - Academic score parses SurveyResponse.trainingRelevance with Number(),
 *    so surveys store "3"/"4"/"5" — not "relevance_direct".
 *  - Audit events are PRESERVED (real usage history), employers are upserted
 *    (never wiped) so demo logins keep working.
 *
 * Compactness: ~3.5k rows total via batched createMany, 300 trainees, and a
 * deterministic PRNG so re-seeding reproduces the same dataset.
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

const PHONE_HASH_PEPPER = process.env.PHONE_HASH_PEPPER || "outcometrack-phone-hash-pepper-2024-change-me";
const PHONE_ENCRYPTION_KEY = process.env.PHONE_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  return Buffer.from(PHONE_ENCRYPTION_KEY, "hex");
}

function encryptPhone(phoneE164: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const normalized = phoneE164.replace(/\D/g, "");
  const encrypted = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, authTag]).toString("base64");
}

function hashPhone(phoneE164: string): string {
  const normalized = phoneE164.replace(/\D/g, "");
  return crypto.createHmac("sha256", PHONE_HASH_PEPPER).update(normalized).digest("hex");
}

// ── deterministic PRNG (mulberry32) ────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260929);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)] as T;
const chance = (p: number) => rand() < p;
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const NOW = new Date();
const DAY = 24 * 60 * 60 * 1000;
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * DAY);
const daysAgo = (days: number) => addDays(NOW, -days);
const uuid = () => crypto.randomUUID();

/** Start of the month `m` months before the current month. */
function monthStart(m: number): Date {
  return new Date(NOW.getFullYear(), NOW.getMonth() - m, 1);
}

// ── catalogues ─────────────────────────────────────────────────────────────
const DISTRICT_WEIGHTS: Array<[string, number]> = [
  ["Pune", 16], ["Mumbai", 14], ["Nagpur", 10], ["Nashik", 9], ["Aurangabad", 7],
  ["Solapur", 6], ["Amravati", 6], ["Kolhapur", 6], ["Sangli", 5], ["Satara", 5],
  ["Ahmednagar", 5], ["Jalgaon", 4], ["Latur", 4], ["Dhule", 3], ["Akola", 3],
  ["Wardha", 2], ["Chandrapur", 2], ["Yavatmal", 2], ["Buldhana", 2], ["Hingoli", 2],
];
const DISTRICTS = DISTRICT_WEIGHTS.map(([d]) => d);
const districtPool: string[] = [];
DISTRICT_WEIGHTS.forEach(([d, w]) => {
  for (let i = 0; i < w; i++) districtPool.push(d);
});

const FIRST_NAMES = [
  "Aarti", "Abhishek", "Aditya", "Akash", "Amol", "Anjali", "Aniket", "Asha", "Ashwin", "Bhavana",
  "Chetan", "Deepak", "Dipika", "Farhan", "Gaurav", "Geeta", "Harsh", "Hemant", "Isha", "Jaya",
  "Kailash", "Kavita", "Kiran", "Lata", "Mahesh", "Manisha", "Nikhil", "Nisha", "Omkar", "Pallavi",
  "Pooja", "Prakash", "Prasad", "Priya", "Rahul", "Rakesh", "Rekha", "Rohan", "Sachin", "Sanjay",
  "Sneha", "Sunil", "Swapna", "Tanvi", "Uday", "Vaishali", "Vikas", "Yogesh",
];
const LAST_NAMES = [
  "Bhosale", "Chavan", "Desai", "Deshmukh", "Gaikwad", "Ghosh", "Jadhav", "Joshi", "Kadam", "Kale",
  "Kapoor", "Khan", "Kulkarni", "Mahajan", "Mehta", "More", "Nair", "Pawar", "Patil", "Pawar",
  "Rane", "Reddy", "Sahu", "Salunkhe", "Shinde", "Shetty", "Singh", "Surve", "Thorat", "Verma",
];

const PROGRAMMES = [
  { name: "PMKVY - IT/ITeS", code: "PMKVY-IT" },
  { name: "PMKVY - Healthcare", code: "PMKVY-HC" },
  { name: "PMKVY - Manufacturing", code: "PMKVY-MFG" },
  { name: "DDU-GKY - Retail", code: "DDUGKY-RTL" },
  { name: "State Skill Mission - Construction", code: "SSM-CONST" },
];

const BANDS = ["LT_10K", "B_10_20K", "B_20_35K", "B_35_50K", "GT_50K"] as const;
const EMPLOYED_OUTCOMES = new Set(["EMPLOYED", "SELF_EMPLOYED", "APPRENTICE"]);

/** Weighted company picker — claims must name real seeded Employers. */
const COMPANIES: Array<{ name: string; w: number; roles: string[] }> = [
  { name: "TechCorp", w: 30, roles: ["Software Support Engineer", "Data Analyst", "Junior Developer", "QA Tester"] },
  { name: "Infotech Solutions", w: 20, roles: ["IT Support Technician", "Data Entry Operator", "Network Assistant", "Billing Executive"] },
  { name: "MegaMart Retail", w: 18, roles: ["Retail Store Associate", "Customer Service Executive", "Billing Executive", "Stock Supervisor"] },
  { name: "MediCare Hospitals", w: 15, roles: ["Nursing Assistant", "Medical Records Clerk", "Pharmacy Assistant", "Patient Attendant"] },
  { name: "Sharma Traders", w: 9, roles: ["Sales Executive", "Store Helper", "Accounts Assistant"] },
  { name: "Desai Enterprises", w: 8, roles: ["Machine Operator", "Quality Inspector", "Helper"] },
];
const companyPool: string[] = [];
COMPANIES.forEach((c) => {
  for (let i = 0; i < c.w; i++) companyPool.push(c.name);
});
const rolesFor = (company: string) => COMPANIES.find((c) => c.name === company)?.roles ?? ["Executive"];

const CERT_NAMES = [
  "AWS Cloud Practitioner", "Google Data Analytics", "Microsoft Azure Fundamentals",
  "Certified Nursing Assistant", "Medical Coding Specialist", "Phlebotomy Technician",
  "CNC Machine Operator", "Welding Certification", "Quality Control Inspector",
  "Retail Sales Associate", "Customer Service Excellence", "Inventory Management",
  "Masonry Level 2", "Electrical Wiring", "Plumbing Certification",
];
const CERT_ISSUERS = [
  "NSDC", "SSC", "NASSCOM", "Healthcare SSC", "Capital Goods SSC",
  "Retailers Association", "Construction SSC", "Maharashtra State Skill Mission",
];

const COURSE_SKILLS = [
  "excel", "data-analysis", "accounting", "tally", "marketing", "python", "react",
  "retail", "customer-service", "cnc", "welding", "electrical", "solar", "nursing",
  "logistics", "banking", "data-entry", "communication", "safety", "quality",
];

// ── distribution helpers ───────────────────────────────────────────────────
/**
 * ~76% placed at the 30-day checkpoint, modulated by the cohort's quality
 * factor (0.6–0.9) so training centers separate in the leaderboard.
 */
function outcome30(quality: number): string {
  const p = 0.72 + quality * 0.22; // 0.85 – 0.92
  const r = rand();
  if (r < p * 0.78) return "EMPLOYED";
  if (r < p * 0.88) return "SELF_EMPLOYED";
  if (r < p) return "APPRENTICE";
  if (r < p + 0.1) return "LOOKING";
  return "NOT_WORKING";
}
/** 84% of placed trainees still employed at 90 days; 12% of the rest land a job late. */
function outcome90(placedAt30: boolean, quality: number): string {
  const r = rand();
  if (placedAt30) {
    const retain = 0.78 + quality * 0.1; // 0.84 – 0.87
    if (r < retain * 0.74) return "EMPLOYED";
    if (r < retain * 0.87) return "SELF_EMPLOYED";
    if (r < retain) return "APPRENTICE";
    if (r < retain + 0.09) return "LOOKING";
    return "NOT_WORKING";
  }
  if (r < 0.12 + quality * 0.08) return "EMPLOYED";
  if (r < 0.56) return "LOOKING";
  return "NOT_WORKING";
}
/** ~60% of placed outcomes carry third-party verification (target is 50%). */
function verification(): "EMPLOYER_CONFIRMED" | "DOCUMENT_VERIFIED" | "SELF_REPORTED" | "PROVIDER_CONFIRMED" {
  const r = rand();
  if (r < 0.4) return "EMPLOYER_CONFIRMED";
  if (r < 0.6) return "DOCUMENT_VERIFIED";
  if (r < 0.95) return "SELF_REPORTED";
  return "PROVIDER_CONFIRMED";
}
function baseBand(): number {
  const r = rand();
  if (r < 0.3) return 0;
  if (r < 0.7) return 1;
  if (r < 0.9) return 2;
  if (r < 0.98) return 3;
  return 4;
}
/** 45% up one band, 10% up two, 30% flat, 15% down → ~35% wage progression. */
function nextBand(idx: number): number {
  const r = rand();
  if (r < 0.45) return Math.min(4, idx + 1);
  if (r < 0.75) return idx;
  if (r < 0.85) return Math.min(4, idx + 2);
  return Math.max(0, idx - 1);
}
function nonPlacementReason(): "NO_JOBS" | "SKILLS_MISMATCH" | "FAMILY" | "HEALTH" | "OTHER" {
  const r = rand();
  if (r < 0.3) return "NO_JOBS";
  if (r < 0.55) return "SKILLS_MISMATCH";
  if (r < 0.7) return "FAMILY";
  if (r < 0.8) return "HEALTH";
  return "OTHER";
}
/** 30d: 82% responded. 90d: 80% responded. */
function followupStatus(responded: number) {
  const r = rand();
  if (r < responded) return "RESPONDED" as const;
  if (r < responded + 0.1) return "SENT" as const;
  if (r < responded + 0.14) return "FAILED" as const;
  return "EXPIRED" as const;
}

// ── main ───────────────────────────────────────────────────────────────────
const TRAINEES = 500;
const DEMO_TRAINEE_ID = "622be85f-ac10-409b-b493-0c8e9592d75a"; // magic-link demo trainee (UI harness)

async function main() {
  console.log("🌱 Seeding chart-accurate demo data (compact)...");

  // ── clean (audit events + employers are deliberately preserved) ─────────
  await prisma.surveyResponse.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.outcomeEvent.deleteMany();
  await prisma.employmentClaim.deleteMany();
  await prisma.botSession.deleteMany();
  await prisma.followupEvent.deleteMany();
  await prisma.enrolment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.employmentHistory.deleteMany();
  await prisma.traineeLoginToken.deleteMany();
  await prisma.jobSeekSignal.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.trainee.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.trainingCenter.deleteMany();
  console.log("🧹 Cleaned demo data (audit events + employers preserved)");

  // ── training centers, courses, programmes ───────────────────────────────
  const CENTER_NAMES = [
    { code: "TC-PUN-01", name: "Pune Skills Academy", district: "Pune" },
    { code: "TC-MUM-01", name: "Mumbai Industrial Training Institute", district: "Mumbai" },
    { code: "TC-NAG-01", name: "Nagarro Skill Center Nagpur", district: "Nagpur" },
    { code: "TC-NAS-01", name: "Nashik Vocational Academy", district: "Nashik" },
    { code: "TC-AUR-01", name: "Aurangabad Technical Institute", district: "Aurangabad" },
    { code: "TC-SOL-01", name: "Solapur Skills Foundation", district: "Solapur" },
    { code: "TC-KOL-01", name: "Kolhapur Trades Academy", district: "Kolhapur" },
    { code: "TC-AMR-01", name: "Amravati Skill Development Center", district: "Amravati" },
    { code: "TC-SAN-01", name: "Sangli PMKVY Center", district: "Sangli" },
    { code: "TC-THA-01", name: "Thane Kaushal Vikas Kendra", district: "Thane" },
  ];
  const centers = await Promise.all(CENTER_NAMES.map((c) => prisma.trainingCenter.create({ data: c })));
  console.log(`✅ ${centers.length} training centers`);

  const COURSE_CATALOGUE: Array<{
    name: string; category: string; skills: string[]; durationWeeks: number; level: string;
    provider: string; description: string;
  }> = [
    { name: "Advanced Excel for Business", category: "IT", skills: ["excel", "data-analysis", "reporting"], durationWeeks: 6, level: "INTERMEDIATE", provider: "PMKVY", description: "Master spreadsheets, pivot tables, and dashboards for office roles." },
    { name: "Tally with GST", category: "Accounting", skills: ["accounting", "tally", "gst"], durationWeeks: 8, level: "INTERMEDIATE", provider: "PMKVY", description: "Computerized accounting and GST filing for finance jobs." },
    { name: "Digital Marketing Fundamentals", category: "Marketing", skills: ["marketing", "social-media", "seo"], durationWeeks: 10, level: "BEGINNER", provider: "PMKVY", description: "Social media, SEO, and ad campaigns for small businesses." },
    { name: "Python Programming Basics", category: "IT", skills: ["python", "programming", "logic"], durationWeeks: 12, level: "BEGINNER", provider: "NSDC", description: "First steps in coding with Python for automation and data." },
    { name: "Full-Stack Web Development", category: "IT", skills: ["javascript", "react", "node", "web-development"], durationWeeks: 24, level: "ADVANCED", provider: "NSDC", description: "Build modern web applications end to end." },
    { name: "Retail Store Operations", category: "Retail", skills: ["retail", "customer-service", "sales"], durationWeeks: 8, level: "BEGINNER", provider: "PMKVY", description: "Store management, billing, and customer handling." },
    { name: "CNC Machine Operation", category: "Manufacturing", skills: ["cnc", "machining", "blueprint-reading"], durationWeeks: 16, level: "INTERMEDIATE", provider: "PMKVY", description: "Operate CNC machines for precision manufacturing." },
    { name: "Industrial Electrician", category: "Electrical", skills: ["electrical", "wiring", "safety"], durationWeeks: 16, level: "INTERMEDIATE", provider: "PMKVY", description: "Installation, maintenance, and safety for industrial electricians." },
    { name: "Solar Panel Technician", category: "Renewable Energy", skills: ["solar", "electrical", "installation"], durationWeeks: 12, level: "INTERMEDIATE", provider: "NSDC", description: "Install and maintain rooftop solar systems." },
    { name: "Welding (TIG & MIG)", category: "Manufacturing", skills: ["welding", "fabrication", "blueprint-reading"], durationWeeks: 12, level: "BEGINNER", provider: "PMKVY", description: "Arc and gas welding techniques for fabrication jobs." },
    { name: "Hospitality & Hotel Operations", category: "Hospitality", skills: ["hospitality", "customer-service", "food-service"], durationWeeks: 12, level: "BEGINNER", provider: "PMKVY", description: "Front office, housekeeping, and F&B service." },
    { name: "Healthcare Nursing Assistant", category: "Healthcare", skills: ["healthcare", "patient-care", "nursing"], durationWeeks: 16, level: "INTERMEDIATE", provider: "PMKVY", description: "Assist nurses with patient care and ward duties." },
    { name: "Beauty & Wellness Entrepreneurship", category: "Beauty", skills: ["beauty", "wellness", "entrepreneurship"], durationWeeks: 8, level: "BEGINNER", provider: "PMKVY", description: "Salon skills plus small-business basics for self-employment." },
    { name: "Logistics & Supply Chain Basics", category: "Logistics", skills: ["logistics", "supply-chain", "inventory"], durationWeeks: 10, level: "BEGINNER", provider: "PMKVY", description: "Warehouse operations, inventory, and dispatch." },
    { name: "Banking & Financial Services", category: "Finance", skills: ["banking", "finance", "customer-service"], durationWeeks: 12, level: "INTERMEDIATE", provider: "NSDC", description: "Banking operations, KYC, and financial products." },
    { name: "Data Entry & Office Assistant", category: "IT", skills: ["data-entry", "typing", "ms-office"], durationWeeks: 6, level: "BEGINNER", provider: "PMKVY", description: "Fast, accurate data entry and office documentation." },
    { name: "Mobile Repair Technician", category: "Electronics", skills: ["mobile-repair", "electronics", "troubleshooting"], durationWeeks: 8, level: "INTERMEDIATE", provider: "PMKVY", description: "Smartphone hardware and software repair." },
    { name: "Automotive Service Technician", category: "Automotive", skills: ["automotive", "mechanical", "diagnostics"], durationWeeks: 16, level: "INTERMEDIATE", provider: "PMKVY", description: "Two-wheeler and four-wheeler service and diagnostics." },
    { name: "Construction Site Supervisor", category: "Construction", skills: ["construction", "site-management", "safety"], durationWeeks: 12, level: "ADVANCED", provider: "PMKVY", description: "Supervise site work, materials, and safety compliance." },
    { name: "Spoken English & Workplace Communication", category: "Soft Skills", skills: ["communication", "english", "interview-skills"], durationWeeks: 8, level: "BEGINNER", provider: "NSDC", description: "Confident workplace English and interview preparation." },
  ];
  await prisma.course.createMany({
    data: COURSE_CATALOGUE.map((c) => ({ ...c, skills: c.skills })),
    skipDuplicates: true,
  });
  console.log(`✅ ${COURSE_CATALOGUE.length} courses`);

  const programmes = await Promise.all(PROGRAMMES.map((p) => prisma.programme.create({ data: p })));
  console.log(`✅ ${programmes.length} programmes`);

  // ── cohorts: 12 × 48-day windows tiling the last ~19 months ─────────────
  // Every certification date therefore lands in exactly one cohort, and
  // per-cohort quality variance gives the leaderboard real spread.
  const COHORT_DAYS = 48;
  const COHORTS = 12;
  const cohorts: Array<{ id: string; startDate: Date; endDate: Date; quality: number; programmeId: string; trainingCenterId: string }> = [];
  for (let i = 0; i < COHORTS; i++) {
    const startDate = daysAgo(COHORT_DAYS * (COHORTS - i));
    const cohort = await prisma.cohort.create({
      data: {
        programmeId: programmes[i % programmes.length]!.id,
        trainingCenterId: centers[i % centers.length]!.id,
        name: `${PROGRAMMES[i % PROGRAMMES.length]!.code} Batch ${String(Math.floor(i / PROGRAMMES.length) + 1).padStart(2, "0")}`,
        startDate,
        endDate: addDays(startDate, COHORT_DAYS),
      },
    });
    cohorts.push({ id: cohort.id, startDate, endDate: addDays(startDate, COHORT_DAYS), quality: 0.6 + rand() * 0.3, programmeId: cohort.programmeId, trainingCenterId: cohort.trainingCenterId! });
  }
  console.log(`✅ ${cohorts.length} cohorts (tiling last ~19 months)`);

  // ── cohort mix: 12-month window heavy, older cohorts retained for peer view ─
  // Trainees are assigned to a BALANCED cohort pool (so no cohort balloons),
  // then given a certification date inside that cohort's window. Recent
  // cohorts are weighted higher so the 12m analytics window is dense.
  const COHORT_WEIGHTS = cohorts.map((_, i) => Math.round(2 + (i / (cohorts.length - 1)) * 5)); // recent = heavier
  const totalWeight = COHORT_WEIGHTS.reduce((a, w) => a + w, 0);
  const cohortPool: number[] = [];
  COHORT_WEIGHTS.forEach((w, idx) => {
    const n = Math.max(1, Math.round((w / totalWeight) * TRAINEES)); // proportional — no cohort balloons
    for (let i = 0; i < n; i++) cohortPool.push(idx);
  });
  // Safety: trim or top up to exactly TRAINEES entries
  while (cohortPool.length > TRAINEES) cohortPool.pop();
  while (cohortPool.length < TRAINEES) cohortPool.push(int(0, cohorts.length - 1));
  for (let i = cohortPool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cohortPool[i], cohortPool[j]] = [cohortPool[j]!, cohortPool[i]!];
  }
  /** A cert date inside `cohort`, day 2–16 of its month so +10d stays in-month. */
  function certDateIn(cohort: (typeof cohorts)[number]): Date {
    const windowDays = Math.floor((cohort.endDate.getTime() - cohort.startDate.getTime()) / DAY);
    for (let attempt = 0; attempt < 24; attempt++) {
      const offset = int(0, Math.max(0, windowDays - 17));
      const d = new Date(cohort.startDate.getTime() + offset * DAY);
      if (d.getDate() >= 2 && d.getDate() <= 16) return d;
    }
    // Deterministic fallback: any 48-day window contains a day-of-month 2–16.
    for (let off = 0; off <= windowDays; off++) {
      const d = new Date(cohort.startDate.getTime() + off * DAY);
      if (d.getDate() >= 2 && d.getDate() <= 16) return d;
    }
    return cohort.startDate;
  }

  // ── trainees ────────────────────────────────────────────────────────────
  const usedPhones = new Set<string>();
  function uniquePhone(): string {
    for (;;) {
      const p = `+91${int(70, 99)}${int(10000000, 99999999)}`;
      if (!usedPhones.has(p)) {
        usedPhones.add(p);
        return p;
      }
    }
  }
  const traineeRows: Array<{ id: string; fullName: string; phoneE164: string; phoneEncrypted: string; phoneHash: string; email: string; district: string; language: string; consentGiven: boolean; consentGivenAt: Date | null; consentMethod: string | null; createdAt: Date }> = [];
  const plans: Array<{ id: string; certDate: Date; cohort: (typeof cohorts)[number] }> = [];
  for (let i = 0; i < TRAINEES; i++) {
    const cohort = cohorts[cohortPool[i]!]!;
    const certDate = certDateIn(cohort);
    const phone = uniquePhone();
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const id = i === 0 ? DEMO_TRAINEE_ID : uuid();
    const consentGiven = chance(0.88);
    traineeRows.push({
      id,
      fullName: `${first} ${last}`,
      phoneE164: phone,
      phoneEncrypted: encryptPhone(phone),
      phoneHash: hashPhone(phone),
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      district: i === 0 ? "Chandrapur" : pick(districtPool), // demo trainee pinned (UI harness expects Chandrapur)
      language: pick(["EN", "HI", "MR"]),
      consentGiven,
      consentGivenAt: consentGiven ? addDays(certDate, -int(10, 60)) : null,
      consentMethod: consentGiven ? "WHATSAPP" : null,
      createdAt: addDays(certDate, -int(30, 90)),
    });
    plans.push({ id, certDate, cohort });
  }
  await prisma.trainee.createMany({ data: traineeRows });
  console.log(`✅ ${traineeRows.length} trainees`);

  // ── enrolments ──────────────────────────────────────────────────────────
  await prisma.enrolment.createMany({
    data: plans.map((p) => ({
      id: uuid(),
      traineeId: p.id,
      cohortId: p.cohort.id,
      certificationDate: p.certDate,
    })),
  });
  console.log(`✅ ${plans.length} enrolments`);

  // ── follow-ups, outcomes, claims ────────────────────────────────────────
  const followups: Array<{ id: string; traineeId: string; cohortId: string; checkpointDays: number; status: string; channel: string; sentAt: Date | null; respondedAt: Date | null; createdAt: Date }> = [];
  const outcomes: Array<{ id: string; traineeId: string; employmentClaimId: string; checkpointDays: number; outcomeStatus: string; verificationStatus: string; source: string; evidenceLevel: number; createdAt: Date }> = [];
  const claims: Array<{ id: string; traineeId: string; followupEventId: string; employerName: string | null; role: string | null; salaryBand: string | null; nonPlacementReason: string | null; verificationStatus: string; evidenceLevel: number; createdAt: Date }> = [];
  const verifications: Array<{ id: string; employmentClaimId: string; tokenHash: string; expiresAt: Date; action: string; usedAt: Date; createdAt: Date }> = [];
  const botSessions: Array<{ id: string; traineeId: string; followupEventId: string; state: string; currentQuestion: string | null; collectedData: object; expiresAt: Date; createdAt: Date }> = [];
  const history: Array<{ id: string; traineeId: string; employer: string; role: string; salaryBand: (typeof BANDS)[number]; startDate: Date; endDate: Date | null; isCurrent: boolean }> = [];
  // Final 90-day state per trainee: drives employment history, surveys and
  // which trainees can back a HIRED job application.
  const finalState = new Map<string, { company: string; band: number }>();
  const unemployedAt90 = new Set<string>();
  const traineeById = new Map(traineeRows.map((t) => [t.id, t]));

  for (const plan of plans) {
    let band = baseBand();
    let placedAt30 = false;
    let company = pick(companyPool);

    for (const checkpoint of [30, 90] as const) {
      // Follow-up sent 8/20 days after certification (all in the past).
      const sentAt = addDays(plan.certDate, checkpoint === 30 ? 8 : 20);
      const status = followupStatus(checkpoint === 30 ? 0.86 : 0.84);
      const fuId = uuid();
      followups.push({
        id: fuId,
        traineeId: plan.id,
        cohortId: plan.cohort.id,
        checkpointDays: checkpoint,
        status,
        channel: pick(["WHATSAPP", "SMS", "EMAIL"]),
        sentAt,
        respondedAt: status === "RESPONDED" ? addDays(sentAt, int(0, 2)) : null,
        createdAt: sentAt,
      });
      botSessions.push({
        id: uuid(),
        traineeId: plan.id,
        followupEventId: fuId,
        state: status === "RESPONDED" ? "DONE" : pick(["AWAITING_STATUS", "AWAITING_SALARY_BAND", "AWAITING_NON_PLACEMENT_REASON"]),
        currentQuestion: status === "RESPONDED" ? null : "What is your employment status?",
        collectedData: {},
        expiresAt: addDays(sentAt, 7),
        createdAt: sentAt,
      });
      if (status !== "RESPONDED") continue;

      // Outcome: createdAt must fall inside the certification month for the
      // monthly aggregation to bucket it (+4d / +10d of a day 2-16 cert date).
      const outcomeStatus = checkpoint === 30 ? outcome30(plan.cohort.quality) : outcome90(placedAt30, plan.cohort.quality);
      const isPlaced = EMPLOYED_OUTCOMES.has(outcomeStatus);
      const claimId = uuid();
      const claimDate = addDays(plan.certDate, checkpoint === 30 ? 4 : 10);
      let claimVerification = "SELF_REPORTED";
      let verificationStatus = "SELF_REPORTED";

      if (isPlaced) {
        verificationStatus = verification();
        claimVerification = verificationStatus;
        if (claimVerification === "EMPLOYER_CONFIRMED" && chance(0.1)) claimVerification = "CONFLICT";
        company = pick(companyPool);
        claims.push({
          id: claimId,
          traineeId: plan.id,
          followupEventId: fuId,
          employerName: company,
          role: pick(rolesFor(company)),
          salaryBand: BANDS[band]!,
          nonPlacementReason: null,
          verificationStatus: claimVerification,
          evidenceLevel: claimVerification === "EMPLOYER_CONFIRMED" ? int(3, 4) : claimVerification === "DOCUMENT_VERIFIED" ? 3 : int(1, 2),
          createdAt: claimDate,
        });
        if (checkpoint === 30) {
          placedAt30 = true;
          band = nextBand(band);
        } else {
          finalState.set(plan.id, { company, band });
        }
        if (claimVerification === "EMPLOYER_CONFIRMED" || claimVerification === "DOCUMENT_VERIFIED") {
          verifications.push({
            id: uuid(),
            employmentClaimId: claimId,
            tokenHash: crypto.randomBytes(32).toString("hex"),
            expiresAt: addDays(claimDate, 30),
            action: "CONFIRMED",
            usedAt: addDays(claimDate, int(1, 5)),
            createdAt: claimDate,
          });
        }
      } else {
        claims.push({
          id: claimId,
          traineeId: plan.id,
          followupEventId: fuId,
          employerName: null,
          role: null,
          salaryBand: null,
          nonPlacementReason: nonPlacementReason(),
          verificationStatus: "SELF_REPORTED",
          evidenceLevel: 1,
          createdAt: claimDate,
        });
        if (checkpoint === 90) unemployedAt90.add(plan.id);
      }
      outcomes.push({
        id: uuid(),
        traineeId: plan.id,
        employmentClaimId: claimId,
        checkpointDays: checkpoint,
        outcomeStatus,
        verificationStatus,
        source: "TRAINEE",
        evidenceLevel: isPlaced ? int(2, 4) : 1,
        createdAt: claimDate,
      });
    }

    const final = finalState.get(plan.id);
    if (final) {
      history.push({
        id: uuid(),
        traineeId: plan.id,
        employer: final.company,
        role: pick(rolesFor(final.company)),
        salaryBand: BANDS[final.band]!,
        startDate: addDays(plan.certDate, 15),
        endDate: null,
        isCurrent: true,
      });
    }
  }
  await prisma.followupEvent.createMany({ data: followups as never });
  await prisma.botSession.createMany({ data: botSessions as never });
  await prisma.employmentClaim.createMany({ data: claims as never });
  await prisma.outcomeEvent.createMany({ data: outcomes as never });
  await prisma.verificationRequest.createMany({ data: verifications as never });
  await prisma.employmentHistory.createMany({ data: history });
  console.log(`✅ ${followups.length} follow-ups · ${claims.length} claims · ${outcomes.length} outcomes · ${verifications.length} verifications`);

  // ── certificates: ~2.2 per trainee (benchmark is 2) ─────────────────────
  const certificates: Array<{ id: string; traineeId: string; name: string; issuer: string; issueDate: Date; expiryDate: Date | null; fileUrl: string | null }> = [];
  for (const plan of plans) {
    const n = chance(0.6) ? 2 : chance(0.71) ? 3 : 1;
    for (let c = 0; c < n; c++) {
      certificates.push({
        id: uuid(),
        traineeId: plan.id,
        name: pick(CERT_NAMES),
        issuer: pick(CERT_ISSUERS),
        issueDate: addDays(plan.certDate, -int(0, 45)),
        expiryDate: chance(0.3) ? addDays(NOW, int(60, 900)) : null,
        fileUrl: chance(0.4) ? `https://storage.example.com/certs/${crypto.randomBytes(16).toString("hex")}.pdf` : null,
      });
    }
  }
  await prisma.certificate.createMany({ data: certificates });
  console.log(`✅ ${certificates.length} certificates`);

  // ── surveys: numeric trainingRelevance so academic scoring works ─────────
  const surveyTrainees = plans.slice(0, 120);
  const EMPLOYMENT_STATUSES = ["employed_full", "employed_part", "self_employed", "apprentice", "looking", "not_working"];
  const SALARY_RANGES = ["salary_0_10k", "salary_10k_15k", "salary_15k_25k", "salary_25k_40k", "salary_40k_60k"];
  const SATISFACTION = ["sat_5", "sat_4", "sat_3", "sat_2", "sat_1"];
  const SKILL_GAPS = ["gap_technical", "gap_communication", "gap_analytical", "gap_domain", "gap_etiquette", "gap_financial"];
  const ADD_TRAINING = ["train_adv_tech", "train_cert", "train_english", "train_entrepreneur", "train_leadership", "train_digital"];
  const CAREER_GOALS = ["goal_promotion", "goal_switch", "goal_education", "goal_business", "goal_abroad", "goal_stay"];
  const CHALLENGES = ["challenge_salary", "challenge_growth", "challenge_skills", "challenge_location", "challenge_balance", "challenge_family"];
  const RECOMMENDATIONS = ["rec_practical", "rec_internship", "rec_tools", "rec_softskills", "rec_placement", "rec_certs"];
  const surveys: Array<Record<string, unknown>> = [];
  for (const plan of surveyTrainees) {
    const final = finalState.get(plan.id);
    const employed = Boolean(final);
    const empStatus = employed ? pick(["employed_full", "employed_part", "self_employed", "apprentice"]) : pick(["looking", "not_working"]);
    const company = final?.company ?? null;
    const relevance = rand() < 0.2 ? "3" : rand() < 0.75 ? "4" : "5";
    surveys.push({
      id: uuid(),
      phoneE164: traineeById.get(plan.id)!.phoneE164,
      traineeId: plan.id,
      employmentStatus: empStatus,
      employerName: company,
      role: company ? pick(rolesFor(company)) : null,
      salaryRange: employed ? pick(SALARY_RANGES) : null,
      jobSatisfaction: employed ? pick(SATISFACTION) : null,
      trainingRelevance: relevance,
      skillGaps: [pick(SKILL_GAPS)],
      additionalTraining: pick(ADD_TRAINING),
      careerGoals: pick(CAREER_GOALS),
      challenges: [pick(CHALLENGES)],
      recommendations: pick(RECOMMENDATIONS),
      language: "EN",
      completedAt: daysAgo(int(5, 180)),
    });
  }
  await prisma.surveyResponse.createMany({ data: surveys as never });
  console.log(`✅ ${surveys.length} survey responses (numeric training relevance)`);

  // ── employers: demo logins kept, peers added for ranking ────────────────
  function hashPassword(plain: string): string {
    const saltHex = crypto.randomBytes(16).toString("hex");
    return `scrypt:${saltHex}:${crypto.scryptSync(plain, saltHex, 64).toString("hex")}`;
  }
  const EMPLOYER_SEED = [
    { companyName: "TechCorp", contactEmail: "hr@company.com", sector: "IT", district: "Chandrapur", registrationNo: "27AAPTU1234A1Z5", hiringNeeds: "Full-stack developers, Data analysts", employeeCount: 50, verificationStatus: "VERIFIED" as const },
    { companyName: "Infotech Solutions", contactEmail: "hr@infotechsolutions.com", sector: "IT", district: "Pune", registrationNo: "27AAECS1234C1Z2", hiringNeeds: "IT support technicians, data entry operators", employeeCount: 120, verificationStatus: "VERIFIED" as const },
    { companyName: "MegaMart Retail", contactEmail: "hr@megamart.com", sector: "Retail", district: "Mumbai", registrationNo: "27AACCM9876R1Z8", hiringNeeds: "Store associates, customer service executives", employeeCount: 340, verificationStatus: "VERIFIED" as const },
    { companyName: "MediCare Hospitals", contactEmail: "hr@medicarehospitals.com", sector: "Healthcare", district: "Nagpur", registrationNo: "27AADCM4567H1Z4", hiringNeeds: "Nursing assistants, pharmacy assistants", employeeCount: 210, verificationStatus: "VERIFIED" as const },
    { companyName: "BuildRight Construction", contactEmail: "hiring@buildright.com", sector: "Construction", district: "Nashik", registrationNo: "27AABCB2222B1Z6", hiringNeeds: "Site supervisors, masons", employeeCount: 80, verificationStatus: "PENDING" as const },
    { companyName: "Swift Logistics", contactEmail: "ops@swiftlogistics.in", sector: "Logistics", district: "Aurangabad", registrationNo: null, hiringNeeds: "Warehouse assistants, delivery executives", employeeCount: 45, verificationStatus: "PENDING" as const },
    { companyName: "GreenVolt Energy", contactEmail: "talent@greenvolt.com", sector: "Renewable Energy", district: "Solapur", registrationNo: null, hiringNeeds: "Solar technicians", employeeCount: 30, verificationStatus: "PENDING" as const },
    { companyName: "AutoWorks India", contactEmail: "hr@autoworks.in", sector: "Automotive", district: "Kolhapur", registrationNo: "27AAECA7777A1Z9", hiringNeeds: "Service technicians, quality inspectors", employeeCount: 95, verificationStatus: "PENDING" as const },
  ];
  for (const e of EMPLOYER_SEED) {
    await prisma.employer.upsert({
      where: { contactEmail: e.contactEmail },
      create: { ...e, passwordHash: hashPassword("employer123") },
      update: { verificationStatus: e.verificationStatus, hiringNeeds: e.hiringNeeds, employeeCount: e.employeeCount },
    });
  }
  const employers = await prisma.employer.findMany();
  const verifiedEmployers = employers.filter((e) => e.verificationStatus === "VERIFIED");
  console.log(`✅ ${employers.length} employers (${verifiedEmployers.length} verified, ${employers.filter((e) => e.verificationStatus === "PENDING").length} pending verification)`);

  // ── job board: postings, applications, job-seek signals ─────────────────
  const JOB_TITLES: Record<string, string[]> = {
    TechCorp: ["Junior Software Developer", "Data Analyst", "QA Engineer", "IT Support Specialist"],
    "Infotech Solutions": ["Data Entry Operator", "Network Support Assistant", "Billing Executive", "Tally Accountant"],
    "MegaMart Retail": ["Retail Store Associate", "Customer Service Executive", "Stock Supervisor", "Billing Executive"],
    "MediCare Hospitals": ["Nursing Assistant", "Medical Records Clerk", "Pharmacy Assistant", "Patient Attendant"],
  };
  const postings: Array<{ id: string; employerId: string; title: string; description: string; employmentType: string; workMode: string; salaryBand: string | null; district: string; skillsRequired: string[]; openings: number; applicationDeadline: Date | null; status: string; createdAt: Date }> = [];
  for (let i = 0; i < 24; i++) {
    const employer = pick(verifiedEmployers);
    const titles = JOB_TITLES[employer.companyName] ?? ["Executive"];
    const isOpen = i < 20;
    const skills = Array.from(new Set(Array.from({ length: int(3, 5) }, () => pick(COURSE_SKILLS))));
    postings.push({
      id: uuid(),
      employerId: employer.id,
      title: pick(titles),
      description: `${employer.hiringNeeds ?? "Hiring"}. Requires hands-on ${skills.slice(0, 3).join(", ")} experience. PMKVY/DDU-GKY certification preferred.`,
      employmentType: pick(["FULL_TIME", "FULL_TIME", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
      workMode: pick(["ONSITE", "ONSITE", "ONSITE", "HYBRID", "HYBRID", "REMOTE"]),
      salaryBand: BANDS[baseBand()]!,
      district: pick(districtPool),
      skillsRequired: skills,
      openings: int(1, 5),
      applicationDeadline: isOpen ? addDays(NOW, int(5, 60)) : daysAgo(int(10, 45)),
      status: isOpen ? "OPEN" : "CLOSED",
      createdAt: daysAgo(int(5, 150)),
    });
  }
  await prisma.jobPosting.createMany({ data: postings as never });
  console.log(`✅ ${postings.length} job postings (${postings.filter((p) => p.status === "OPEN").length} open)`);

  // Applications: HIRED rows feed employer reliability, and MegaMart's hires
  // are deliberately paired with trainees who did NOT sustain employment so
  // the "board self-cleans" flag has a real example.
  const openPostings = postings.filter((p) => p.status === "OPEN");
  const employerNameById = new Map(employers.map((e) => [e.id, e.companyName]));
  const employedPlans = plans.filter((p) => finalState.has(p.id));
  const unemployedPlans = plans.filter((p) => unemployedAt90.has(p.id));
  const applications: Array<{ id: string; jobPostingId: string; traineeId: string; status: string; createdAt: Date; updatedAt: Date }> = [];
  const usedPairs = new Set<string>();
  for (let i = 0; i < 90; i++) {
    const posting = pick(openPostings);
    const company = employerNameById.get(posting.employerId)!;
    const wantHired = i < 18;
    const pool = wantHired
      ? (company === "MegaMart Retail" ? unemployedPlans : employedPlans)
      : plans;
    if (pool.length === 0) continue;
    const trainee = pick(pool);
    const key = `${posting.id}:${trainee.id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);
    const status = wantHired ? "HIRED" : pick(["APPLIED", "APPLIED", "APPLIED", "SHORTLISTED", "SHORTLISTED", "REJECTED"]);
    const createdAt = daysAgo(int(3, 120));
    applications.push({ id: uuid(), jobPostingId: posting.id, traineeId: trainee.id, status, createdAt, updatedAt: createdAt });
  }
  await prisma.jobApplication.createMany({ data: applications as never });
  console.log(`✅ ${applications.length} job applications (${applications.filter((a) => a.status === "HIRED").length} hires)`);

  const signals: Array<{ id: string; traineeId: string; reason: string; district: string; createdAt: Date }> = [];
  for (let i = 0; i < 60; i++) {
    const trainee = i < 40 && unemployedPlans.length > 0 ? pick(unemployedPlans) : pick(plans);
    signals.push({ id: uuid(), traineeId: trainee.id, reason: nonPlacementReason(), district: traineeById.get(trainee.id)!.district, createdAt: daysAgo(int(1, 150)) });
  }
  await prisma.jobSeekSignal.createMany({ data: signals as never });
  console.log(`✅ ${signals.length} job-seek signals`);

  console.log("🎉 Seed complete. Demo logins: hr@company.com/employer123, hr@infotechsolutions.com/employer123, admin@maharashtra.gov.in/admin123, institute@pmkvy.gov.in/institute123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
