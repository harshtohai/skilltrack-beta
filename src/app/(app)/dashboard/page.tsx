import { auth } from "~/lib/auth";
import { DashboardView } from "./dashboard-view";

/**
 * /dashboard serves admin, institute and trainee (§9.1 — admin/institute see
 * the KPI view; trainees land on the jobs board, reskinned in UI-09). The
 * session is resolved server-side via auth() — same pattern as the (app)
 * layout — so the name and role never race a client fetch.
 */
export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role ?? "trainee";
  const name = session?.user?.name ?? "";

  return <DashboardView userName={name} isTrainee={role === "trainee"} />;
}
