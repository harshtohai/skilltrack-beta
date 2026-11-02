import type { UserRole } from "~/lib/protected-routes";

/**
 * Cohort-level half of INST-01: an institute may only read or write cohorts
 * that belong to ITS center. Admin is global; every other role is denied.
 *
 * Pure policy (no session/DB imports) so it is unit-testable and safe to call
 * from server components and route handlers alike.
 *
 * Callers answer 404 (not 403) for an out-of-scope cohort so the API never
 * confirms that another center's record exists.
 */
export function canAccessCohort(
  scope: { role: UserRole; centerId: string | null },
  cohort: { trainingCenterId: string | null } | null | undefined,
): boolean {
  if (!cohort) return false;
  if (scope.role === "admin") return true;
  if (scope.role !== "institute") return false;
  return Boolean(scope.centerId) && cohort.trainingCenterId === scope.centerId;
}
