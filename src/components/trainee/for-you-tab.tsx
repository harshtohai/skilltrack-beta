"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Building2, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";

interface CourseRecommendation {
  courseId: string;
  courseName: string;
  category: string;
  provider: string;
  durationWeeks: number;
  reason: string;
  score: number;
}

interface EmployerRecommendation {
  employerName: string;
  retentionScore: number;
  claimCount: number;
}

interface RecommendationsResponse {
  skillGaps: string[];
  employed: boolean;
  courses: CourseRecommendation[];
  employers: EmployerRecommendation[];
}

/**
 * T8 (spec #102): the third dashboard tab. Surfaces the recommendations the
 * platform already computes (course matches for survey skill gaps; employers
 * with strong verified retention) — the API existed with zero UI consumers.
 */
export function ForYouTab() {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/v1/trainee/recommendations");
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as RecommendationsResponse);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <ErrorState
        title="Couldn't load recommendations"
        description="Check your connection and retry."
        onRetry={() => void load()}
      />
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-h3 font-medium">Courses for your skill gaps</h2>
        {data.courses.length === 0 ? (
          <Card className="p-5">
            <p className="text-body-sm text-muted-foreground">
              No course matches yet — recommendations appear once your survey answers show skill gaps.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.courses.map((course) => (
              <Card key={course.courseId} className="p-5">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-0">
                  <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <CardTitle className="text-body font-medium">{course.courseName}</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      {course.category} · {course.provider} · {course.durationWeeks} weeks
                    </p>
                  </div>
                </CardHeader>
                {course.reason ? (
                  <CardContent className="p-0 pt-3">
                    <p className="text-caption text-muted-foreground">{course.reason}</p>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-h3 font-medium">Employers with strong retention</h2>
        {data.employers.length === 0 ? (
          <Card className="p-5">
            <p className="text-body-sm text-muted-foreground">
              No employer suggestions yet — they appear once verified employment history exists.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.employers.map((employer) => (
              <Card key={employer.employerName} className="p-5">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-0">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <CardTitle className="text-body font-medium">{employer.employerName}</CardTitle>
                    <p className="text-caption text-muted-foreground">
                      {employer.retentionScore}% of hires still employed at later checkpoints · {employer.claimCount} verified {employer.claimCount === 1 ? "record" : "records"}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={() => void load()} className="gap-2 text-muted-foreground">
          <RefreshCw className="size-3.5" aria-hidden /> Refresh
        </Button>
      </div>
    </div>
  );
}
