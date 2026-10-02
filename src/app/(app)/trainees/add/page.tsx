import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { EmptyState } from "~/components/patterns/empty-state";
import { PageHeader } from "~/components/patterns/page-header";
import { AddTraineeForm } from "./add-trainee-form";

export const dynamic = "force-dynamic";

/**
 * Add trainee (INST-02) per design §9.6 — Shell S1, form constrained to
 * max-w-2xl. Server component: the programme/cohort options load here with
 * the session's center filter (INST-01) — lazier than an API round-trip; the
 * form (react-hook-form + zod) renders through add-trainee-form.tsx (client).
 */
export default async function AddTraineePage() {
  const scope = await getSessionScope();

  const [programmes, cohorts] = await Promise.all([
    db.programme.findMany({ orderBy: { name: "asc" } }),
    db.cohort.findMany({
      // Institutes pick from their center's cohorts; admin sees all centers.
      where: scope.centerId ? { trainingCenterId: scope.centerId } : {},
      include: { programme: true },
      orderBy: { startDate: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Add trainee"
        caption="Create the record and pick a cohort — the enrollment email with their sign-in link goes out."
      />

      {cohorts.length === 0 ? (
        <EmptyState
          title="No cohorts yet"
          description="A trainee needs a cohort to enrol in. Ask an admin to create a cohort for your training center."
        />
      ) : (
        <AddTraineeForm
          programmes={programmes.map((p) => ({ id: p.id, name: p.name }))}
          cohorts={cohorts.map((c) => ({
            id: c.id,
            name: c.name,
            programmeId: c.programmeId,
          }))}
        />
      )}
    </div>
  );
}
