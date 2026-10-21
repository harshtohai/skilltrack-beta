import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse } from "~/app/api/v1/_utils";
import { humanizeSkill, isValidLevel, latestBySkill, SKILL_LEVELS } from "~/server/skills";

export const dynamic = "force-dynamic";

/**
 * Skills self-assessment (bag #44): the trainee rates their programme course's
 * skills 1–5. Level-1 evidence per the recorded integrity model — employers
 * never see it, nothing gates on it; consumers are the trainee's own
 * recommendations and the institute's coaching view. Assessments are
 * append-only (history kept, latest shown per skill).
 */

async function resolveSkillsCourse(traineeId: string) {
  const enrolments = await db.enrolment.findMany({
    where: { traineeId },
    include: { cohort: { include: { programme: { include: { course: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const active = enrolments.find((e) => e.status === "ACTIVE");
  const chosen = active ?? enrolments[0];
  return chosen?.cohort.programme.course ?? null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const course = await resolveSkillsCourse(traineeId);
    if (!course || course.skills.length === 0) {
      return NextResponse.json({ course: null, skills: [], levelLabels: SKILL_LEVELS });
    }

    const assessments = await db.skillAssessment.findMany({
      where: { traineeId, skill: { in: course.skills } },
      orderBy: { assessedAt: "asc" },
    });
    const latest = latestBySkill(assessments);

    return NextResponse.json({
      course: { id: course.id, name: course.name },
      skills: course.skills.map((skill) => {
        const history = assessments
          .filter((a) => a.skill === skill)
          .map((a) => ({ level: a.level, assessedAt: a.assessedAt.toISOString() }));
        return {
          skill,
          label: humanizeSkill(skill),
          level: latest.get(skill)?.level ?? null,
          assessedAt: latest.get(skill)?.assessedAt.toISOString() ?? null,
          history,
        };
      }),
      levelLabels: SKILL_LEVELS,
    });
  } catch (error) {
    console.error("GET /api/v1/trainee/skills error:", error);
    return routeErrorResponse("Failed to load skills", error);
  }
}

const postSchema = z.object({
  levels: z
    .array(z.object({ skill: z.string().trim().min(1), level: z.number().int() }))
    .min(1)
    .max(50),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const traineeId = session.user.id;

    const course = await resolveSkillsCourse(traineeId);
    if (!course || course.skills.length === 0) {
      return createErrorResponse("NOT_FOUND", "Your programme has no skill list yet", 409);
    }

    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return createErrorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    // Dedupe (last wins) and validate: skills must belong to the course's list,
    // levels must be integers 1–5. Anything else is a validation error — this
    // endpoint can never create assessments for skills outside the programme.
    const bySkill = new Map(parsed.data.levels.map((l) => [l.skill, l.level]));
    const invalidSkill = [...bySkill.keys()].find((s) => !course.skills.includes(s));
    if (invalidSkill) {
      return createErrorResponse("VALIDATION_ERROR", `Unknown skill: ${invalidSkill}`, 400);
    }
    const invalidLevel = [...bySkill.entries()].find(([, level]) => !isValidLevel(level));
    if (invalidLevel) {
      return createErrorResponse("VALIDATION_ERROR", `Level for ${invalidLevel[0]} must be 1–5`, 400);
    }

    const now = new Date();
    await db.skillAssessment.createMany({
      data: [...bySkill.entries()].map(([skill, level]) => ({
        traineeId,
        skill,
        level,
        assessedAt: now,
      })),
    });

    await db.auditEvent.create({
      data: {
        entityType: "SkillAssessment",
        entityId: traineeId,
        action: "SKILLS_ASSESSED",
        actorType: "TRAINEE",
        actorId: traineeId,
        metadata: { count: bySkill.size, course: course.name },
      },
    });

    return NextResponse.json({ saved: bySkill.size });
  } catch (error) {
    console.error("POST /api/v1/trainee/skills error:", error);
    return routeErrorResponse("Failed to save skills", error);
  }
}
