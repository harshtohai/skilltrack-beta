import { auth } from "~/lib/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar, type SidebarUser } from "~/components/layouts/app-sidebar";

/**
 * S1 app shell (design §3.1/CL-01): SidebarProvider → Sidebar (role-aware) →
 * SidebarInset. Sidebar fixed full-height; content scrolls (p-6 at md+, p-4
 * at base). All authenticated pages render inside this layout — pages never
 * re-implement sidebar/header. Mobile: trigger bar (§11).
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const user: SidebarUser = session?.user
    ? {
        name: session.user.name ?? "",
        role: session.user.role ?? "trainee",
      }
    : null;

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        {/* Mobile/tablet trigger bar (§11 — sidebar is off-canvas <lg) */}
        <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4 lg:hidden">
          <SidebarTrigger />
          <span className="text-title font-semibold">SkillsTrack</span>
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
