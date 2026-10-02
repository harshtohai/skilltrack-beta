import {
  BarChart3,
  CalendarClock,
  AlertTriangle,
  ScrollText,
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  CirclePlus,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "~/lib/protected-routes";

/**
 * Role-aware navigation per design §15.7: primary nav 4–8 core areas ordered
 * by frequency, grouped into collapsible sections where it helps. Labels MUST
 * match page titles (CL-27). Pure data — safe for client components.
 */

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label?: string; items: NavItem[] };

/** Operations surfaces — identical for admin and institute (shared reference). */
const OPERATIONS: NavGroup = {
  label: "Operations",
  items: [
    { label: "All trainees", href: "/trainees", icon: Users },
    { label: "Follow-up operations", href: "/followups", icon: CalendarClock },
    { label: "Conflict queue", href: "/conflicts", icon: AlertTriangle },
    { label: "Audit log viewer", href: "/audit-logs", icon: ScrollText },
  ],
};

export const navForRole: Record<UserRole, NavGroup[]> = {
  admin: [
    {
      label: "Tracking",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Government analytics", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    OPERATIONS,
  ],
  institute: [
    {
      label: "Tracking",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Institute analytics", href: "/institute/analytics", icon: BarChart3 },
      ],
    },
    OPERATIONS,
  ],
  employer: [
    {
      items: [
        { label: "Employer dashboard", href: "/employer/dashboard", icon: BriefcaseBusiness },
        { label: "Post a job", href: "/employer/dashboard/post-job", icon: CirclePlus },
      ],
    },
  ],
  trainee: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "My profile", href: "/trainee/profile", icon: UserRound },
      ],
    },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Government admin",
  institute: "Institute",
  employer: "Employer",
  trainee: "Trainee",
};

/** Whether `href` is the active route (startsWith covers detail pages). */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
