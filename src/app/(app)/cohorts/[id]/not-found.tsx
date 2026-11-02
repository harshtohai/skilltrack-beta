import Link from "next/link";
import { Button } from "~/components/ui/button";

/**
 * Cohort 404 (INST-01): used for cohorts that do not exist AND for cohorts
 * outside the signed-in institute's center — the two must be indistinguishable
 * so the page can't be used to probe another center's records.
 */
export default function CohortNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-h2 font-semibold">Cohort not found</h1>
      <p className="mt-1 text-body-sm text-muted-foreground">
        That cohort ID does not match any record.
      </p>
      <Button asChild className="mt-4">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
