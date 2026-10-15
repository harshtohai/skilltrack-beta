"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/patterns/skeleton";
import { ErrorState } from "~/components/patterns/error-state";
import { EmptyState } from "~/components/patterns/empty-state";
import { date } from "~/lib/format";
import { SKILL_LEVELS } from "~/server/skills";

interface SkillRow {
  skill: string;
  label: string;
  level: number | null;
  assessedAt: string | null;
  history: Array<{ level: number; assessedAt: string }>;
}

interface SkillsResponse {
  course: { id: string; name: string } | null;
  skills: SkillRow[];
  levelLabels: Array<{ value: number; label: string }>;
}

const LEVEL_HINTS: Record<number, string> = Object.fromEntries(SKILL_LEVELS.map((l) => [l.value, l.label]));

/**
 * Skills self-assessment (bag #44): the trainee rates their programme course's
 * skills 1–5. The straight-up disclosure contract sits above the rating —
 * who sees it (trainee + training center, never employers), what it decides
 * (course/job suggestions only), retake any time with history kept.
 * Assessments are append-only; the latest level is shown.
 */
export function SkillsSection() {
  const [data, setData] = useState<SkillsResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch("/api/v1/trainee/skills");
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as SkillsResponse;
      setData(json);
      const current: Record<string, number> = {};
      for (const s of json.skills) if (s.level !== null) current[s.skill] = s.level;
      setLevels(current);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = data !== null && data.skills.some((s) => levels[s.skill] !== s.level);
  const answeredCount = data ? data.skills.filter((s) => levels[s.skill] !== undefined).length : 0;

  async function handleSave() {
    if (!data) return;
    const payload = data.skills
      .filter((s) => levels[s.skill] !== undefined)
      .map((s) => ({ skill: s.skill, level: levels[s.skill] }));
    if (payload.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/trainee/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levels: payload }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!res.ok) {
        toast.error(body.error?.message ?? "Could not save your skills.");
        return;
      }
      toast.success("Skills saved — thanks for honest answers.");
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card id="skills" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {data === null ? (
          loadError ? (
            <ErrorState
              title="Couldn't load skills"
              description="Check your connection and retry."
              onRetry={() => void load()}
            />
          ) : (
            <div className="space-y-3 py-2" aria-busy>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )
        ) : data.skills.length === 0 ? (
          <EmptyState
            title="No skill list yet"
            description="Skills appear here once your programme is linked to a course with a skill list."
          />
        ) : (
          <>
            {/* Straight-up disclosure contract (owner directive, Oct 13) */}
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-caption">
              <p className="font-medium text-foreground">Before you rate yourself — straight up:</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Who sees this:</span> you, and your training
                  center. <span className="font-medium text-foreground">Employers never see it.</span>
                </li>
                <li>
                  <span className="font-medium text-foreground">What it decides:</span> which courses and jobs
                  we suggest to you. That's all.
                </li>
                <li>
                  <span className="font-medium text-foreground">What it doesn't decide:</span> your
                  certificates, your applications, your placement — none of it. Overstate a skill and the only
                  person you fool is yourself: the courses you actually need stop showing up.
                </li>
                <li>Rate yourself as you are today. Retake any time — your history stays.</li>
              </ul>
            </div>

            <div className="space-y-4">
              {data.skills.map((s) => (
                <div key={s.skill}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-body-sm font-medium">{s.label}</span>
                    {s.level !== null && s.assessedAt ? (
                      <span className="text-caption text-muted-foreground">
                        last rated {LEVEL_HINTS[s.level]?.toLowerCase()} · {date(s.assessedAt)}
                        {s.history.length > 1 ? ` · ${s.history.length} times` : ""}
                      </span>
                    ) : (
                      <span className="text-caption text-muted-foreground">not rated yet</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Rate ${s.label}`}>
                    {SKILL_LEVELS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        role="radio"
                        aria-checked={levels[s.skill] === l.value}
                        onClick={() => setLevels((prev) => ({ ...prev, [s.skill]: l.value }))}
                        className={`rounded-md border px-2.5 py-1 text-caption transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 ${
                          levels[s.skill] === l.value
                            ? "border-primary bg-primary/10 font-medium text-foreground"
                            : "border-border text-muted-foreground hover:bg-accent"
                        }`}
                        title={l.label}
                      >
                        {l.value}
                      </button>
                    ))}
                    <span className="self-center text-caption text-muted-foreground">
                      {LEVEL_HINTS[levels[s.skill] ?? 0] ?? "pick a level"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-caption text-muted-foreground">
                {answeredCount}/{data.skills.length} rated · {data.course?.name}
              </p>
              <Button size="sm" onClick={() => void handleSave()} disabled={saving || !dirty}>
                {saving ? "Saving…" : dirty ? "Save skills" : "Saved"}
              </Button>
            </div>
            <p className="mt-2 text-caption text-muted-foreground">
              Level guide: {SKILL_LEVELS.map((l) => `${l.value} ${l.label.toLowerCase()}`).join(" · ")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
