"use client";

import { FormLabel } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

/**
 * Programme → cohort pickers, shared by BOTH add-trainee paths (manual step 2
 * and the SkillID link flow). Controlled + presentational so each parent owns
 * its state; cohort options follow the chosen programme (§4.2 dependent
 * Selects) and a programme switch invalidates the chosen cohort.
 */
export function EnrollmentSelect({
  programmes,
  cohorts,
  programmeId,
  cohortId,
  onProgrammeChange,
  onCohortChange,
  disabled,
  errors,
}: {
  programmes: { id: string; name: string }[];
  cohorts: { id: string; name: string; programmeId: string }[];
  programmeId: string;
  cohortId: string;
  onProgrammeChange: (id: string) => void;
  onCohortChange: (id: string) => void;
  disabled?: boolean;
  errors?: { programmeId?: string; cohortId?: string };
}) {
  const programmeCohorts = cohorts.filter((c) => c.programmeId === programmeId);

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <FormLabel>
          Programme <span className="text-danger-text">*</span>
        </FormLabel>
        <Select
          onValueChange={(v) => {
            onProgrammeChange(v);
            onCohortChange("");
          }}
          value={programmeId}
          disabled={disabled}
        >
          <SelectTrigger className="w-full" aria-invalid={errors?.programmeId ? true : undefined}>
            <SelectValue placeholder="Select programme" />
          </SelectTrigger>
          <SelectContent>
            {programmes.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.programmeId ? (
          <p role="alert" className="text-caption text-danger-text">
            {errors.programmeId}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <FormLabel>
          Cohort <span className="text-danger-text">*</span>
        </FormLabel>
        <Select onValueChange={onCohortChange} value={cohortId} disabled={Boolean(disabled) || !programmeId}>
          <SelectTrigger className="w-full" aria-invalid={errors?.cohortId ? true : undefined}>
            <SelectValue placeholder={programmeId ? "Select cohort" : "Pick a programme first"} />
          </SelectTrigger>
          <SelectContent>
            {programmeCohorts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.cohortId ? (
          <p role="alert" className="text-caption text-danger-text">
            {errors.cohortId}
          </p>
        ) : null}
      </div>
    </div>
  );
}
