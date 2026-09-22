/**
 * Idempotent backfill: creates TrainingCenters + Courses and assigns
 * existing cohorts to centers. Safe to run repeatedly (upserts only).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CENTERS: Array<{ code: string; name: string; district: string }> = [
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

const COURSES: Array<{
  name: string; category: string; skills: string[]; durationWeeks: number; level: string; provider: string; description: string;
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

async function main() {
  console.log("🏫 Backfilling training centers...");
  const centers: Array<{ id: string; code: string }> = [];
  for (const c of CENTERS) {
    const center = await prisma.trainingCenter.upsert({
      where: { code: c.code },
      create: c,
      update: { name: c.name, district: c.district },
    });
    centers.push({ id: center.id, code: center.code });
  }
  console.log(`✅ ${centers.length} training centers ready`);

  console.log("📚 Backfilling courses...");
  for (const c of COURSES) {
    await prisma.course.upsert({
      where: { name: c.name },
      create: c,
      update: { skills: c.skills, category: c.category },
    });
  }
  console.log(`✅ ${COURSES.length} courses ready`);

  console.log("🔗 Assigning cohorts to centers (round-robin)...");
  const cohorts = await prisma.cohort.findMany({ orderBy: { name: "asc" } });
  let assigned = 0;
  for (let i = 0; i < cohorts.length; i++) {
    const cohort = cohorts[i];
    if (!cohort) continue;
    if (cohort.trainingCenterId) continue;
    const center = centers[i % centers.length];
    if (!center) break;
    await prisma.cohort.update({
      where: { id: cohort.id },
      data: { trainingCenterId: center.id },
    });
    assigned++;
  }
  console.log(`✅ ${assigned} cohorts assigned to centers (${cohorts.length} total)`);

  const unassigned = await prisma.cohort.count({ where: { trainingCenterId: null } });
  if (unassigned > 0) console.log(`⚠️ ${unassigned} cohorts remain unassigned`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());