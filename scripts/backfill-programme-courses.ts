// One-time backfill (bag #44 / issue #115): the Programme ↔ Course link is new
// — seeded programmes predate it. Round-robin over the course catalogue so
// every programme gets a skill list. Idempotent: only rows with courseId NULL.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const programmes = await prisma.programme.findMany({ where: { courseId: null }, orderBy: { name: "asc" } });
  const courses = await prisma.course.findMany({ select: { id: true }, orderBy: { name: "asc" } });
  if (courses.length === 0) {
    console.log("No courses seeded — nothing to link.");
    return;
  }
  let linked = 0;
  for (let i = 0; i < programmes.length; i++) {
    const programme = programmes[i];
    const course = courses[i % courses.length];
    if (!programme || !course) continue;
    await prisma.programme.update({ where: { id: programme.id }, data: { courseId: course.id } });
    linked++;
  }
  console.log(`✅ linked ${linked} programmes → courses (round-robin over ${courses.length} courses)`);
  await prisma.$disconnect();
}

main();
