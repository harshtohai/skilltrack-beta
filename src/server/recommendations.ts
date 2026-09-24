export interface CourseInfo {
  id: string;
  name: string;
  category: string;
  skills: string[];
  durationWeeks: number;
  level: string;
  provider: string;
}

export interface TraineeProfileInfo {
  /** Skill gaps from the trainee's survey responses */
  skillGaps: string[];
  /** Latest known outcome is an employed status */
  employed: boolean;
  district: string;
}

export interface CourseRecommendation {
  courseId: string;
  courseName: string;
  category: string;
  provider: string;
  durationWeeks: number;
  reason: string;
  score: number;
}

export interface EmployerRetentionInfo {
  employerName: string;
  /** 0-100 from the retention engine; null = insufficient evidence */
  retentionScore: number | null;
  claimCount: number;
}

export interface EmployerRecommendation {
  employerName: string;
  retentionScore: number;
  claimCount: number;
}

const MIN_EMPLOYER_RETENTION = 50;

function matchesGap(haystack: string[], needle: string): boolean {
  const n = needle.trim().toLowerCase();
  if (!n) return false;
  return haystack.some((h) => h.trim().toLowerCase().includes(n) || n.includes(h.trim().toLowerCase()));
}

/**
 * Course recommendations matched on the trainee's skill gaps, employment
 * status (short courses boosted for the unemployed) and district. Courses
 * with no match signal are not recommended.
 */
export function recommendCourses(
  trainee: TraineeProfileInfo,
  courses: CourseInfo[],
  limit = 5
): CourseRecommendation[] {
  const scored = courses.map((course) => {
    let score = 0;
    const reasons: string[] = [];

    const matchedSkills = course.skills.filter((s) => matchesGap(trainee.skillGaps, s));
    if (matchedSkills.length > 0) {
      score += 3 * matchedSkills.length;
      reasons.push(`Matches your skill gaps: ${matchedSkills.slice(0, 3).join(", ")}`);
    }

    if (matchesGap(trainee.skillGaps, course.category)) {
      score += 2;
      reasons.push(`Related to ${course.category}`);
    }

    if (!trainee.employed && course.durationWeeks <= 12) {
      score += 1;
      reasons.push("Short course for quick re-employment");
    }

    if (
      trainee.district &&
      course.provider.trim().toLowerCase().includes(trainee.district.trim().toLowerCase())
    ) {
      score += 1;
      reasons.push("Offered near your district");
    }

    return { course, score, reason: reasons.join(" · ") };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.course.durationWeeks - b.course.durationWeeks)
    .slice(0, limit)
    .map((s) => ({
      courseId: s.course.id,
      courseName: s.course.name,
      category: s.course.category,
      provider: s.course.provider,
      durationWeeks: s.course.durationWeeks,
      reason: s.reason,
      score: s.score,
    }));
}

/**
 * Employer suggestions ranked by retention score. Employers below 50%
 * retention, with null scores (insufficient evidence) or no claims are
 * excluded entirely.
 */
export function recommendEmployers(
  retentions: EmployerRetentionInfo[],
  limit = 5
): EmployerRecommendation[] {
  const eligible = retentions.filter(
    (r) =>
      r.retentionScore !== null &&
      r.retentionScore >= MIN_EMPLOYER_RETENTION &&
      r.claimCount > 0
  );
  return eligible
    .sort((a, b) => (b.retentionScore ?? 0) - (a.retentionScore ?? 0) || b.claimCount - a.claimCount)
    .slice(0, limit)
    .map((r) => ({
      employerName: r.employerName,
      retentionScore: r.retentionScore ?? 0,
      claimCount: r.claimCount,
    }));
}
