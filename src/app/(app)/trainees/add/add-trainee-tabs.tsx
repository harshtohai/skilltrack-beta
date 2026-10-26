"use client";

import { useState } from "react";
import { Fingerprint, UserRoundPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AddTraineeForm, type CohortOption, type ProgrammeOption } from "./add-trainee-form";
import { SkillIdFlow } from "./skill-id-flow";

/**
 * Mode switch for add-trainee v2: "Has a SkillID" links an EXISTING global
 * trainee into this center (lookup → confirm → enrol); "New trainee" is the
 * two-step manual form. The enrollment step is shared by both paths.
 */
export function AddTraineeTabs({
  programmes,
  cohorts,
}: {
  programmes: ProgrammeOption[];
  cohorts: CohortOption[];
}) {
  const [mode, setMode] = useState<"skill-id" | "manual">("skill-id");

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as "skill-id" | "manual")} className="max-w-2xl">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="skill-id" className="gap-2">
          <Fingerprint className="size-4" /> Has a SkillID
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-2">
          <UserRoundPlus className="size-4" /> New trainee
        </TabsTrigger>
      </TabsList>
      <TabsContent value="skill-id" className="mt-4">
        <SkillIdFlow programmes={programmes} cohorts={cohorts} onSwitchToManual={() => setMode("manual")} />
      </TabsContent>
      <TabsContent value="manual" className="mt-4">
        <AddTraineeForm programmes={programmes} cohorts={cohorts} />
      </TabsContent>
    </Tabs>
  );
}
