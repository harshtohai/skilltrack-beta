import { auth } from "~/lib/auth";
import type { UserRole } from "~/lib/protected-routes";

/**
 * Session-derived scope (INST-01): the institute maps to ONE TrainingCenter,
 * carried on the JWT as `instituteCenterId` and resolved at sign-in from
 * INSTITUTE_CENTER_CODE. Admin and other roles have no center (null).
 */
export async function getSessionScope(): Promise<{ role: UserRole; centerId: string | null }> {
  const session = await auth();
  const role: UserRole = session?.user?.role ?? "trainee";
  const centerId = role === "institute" ? (session?.user?.instituteCenterId ?? null) : null;
  return { role, centerId };
}
