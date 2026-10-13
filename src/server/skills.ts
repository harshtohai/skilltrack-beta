/**
 * Skills self-assessment (bag #44, ADR-free small feature): pure helpers for
 * the trainee's 1–5 self-rating of their programme course's skills.
 *
 * Integrity model (owner directive): this is level-1 evidence — employers
 * never see it, nothing gates on it; its only consumers are the trainee's own
 * recommendations and the institute's coaching view. Assessments are
 * append-only (history kept, latest shown).
 */

export const SKILL_LEVELS = [
  { value: 1, label: "Never used it" },
  { value: 2, label: "Watched someone use it" },
  { value: 3, label: "Can use it with help" },
  { value: 4, label: "Can work independently" },
  { value: 5, label: "Can teach others" },
] as const;

/** "data-analysis" → "Data analysis" (course skills are stored as slugs). */
export function humanizeSkill(slug: string): string {
  const s = slug.trim().replace(/[-_]+/g, " ");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function isValidLevel(level: unknown): level is number {
  return typeof level === "number" && Number.isInteger(level) && level >= 1 && level <= 5;
}

export interface SkillAssessmentRecord {
  skill: string;
  level: number;
  assessedAt: Date;
}

/** Latest assessment per skill (append-only storage, latest wins for display). */
export function latestBySkill(
  assessments: SkillAssessmentRecord[],
): Map<string, { level: number; assessedAt: Date }> {
  const latest = new Map<string, { level: number; assessedAt: Date }>();
  for (const a of assessments) {
    const prev = latest.get(a.skill);
    if (!prev || a.assessedAt > prev.assessedAt) {
      latest.set(a.skill, { level: a.level, assessedAt: a.assessedAt });
    }
  }
  return latest;
}
