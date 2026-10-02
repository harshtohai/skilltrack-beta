// Pure data — safe to import from client components and middleware/edge.
// Mirrors src/lib/auth.config.ts (which re-exports it) and used by the
// login page to validate post-login redirects per role.

export type UserRole = "admin" | "institute" | "employer" | "trainee";

export const protectedRoutes: {
  path: string;
  roles: UserRole[];
  /** Methods that skip the role check (e.g. unauthenticated self-signup POST). */
  publicMethods?: string[];
}[] = [
  // Pages — order matters: "/trainees" must precede "/trainee" (startsWith).
  { path: "/admin", roles: ["admin"] },
  { path: "/institute", roles: ["institute", "admin"] },
  { path: "/employer", roles: ["employer", "admin"] },
  { path: "/trainees", roles: ["admin", "institute"] },
  { path: "/trainee", roles: ["trainee"] },
  { path: "/dashboard", roles: ["admin", "institute", "trainee"] },
  { path: "/followups", roles: ["admin"] }, // INST-01: gov-authority surface
  { path: "/cohorts", roles: ["admin", "institute"] },
  { path: "/conflicts", roles: ["admin"] }, // INST-01: gov-authority surface
  { path: "/audit-logs", roles: ["admin"] }, // INST-01: gov-authority surface
  // API — server-side data endpoints. Client pages fetch these with the
  // session cookie, so edge pre-checks don't break them.
  { path: "/api/v1/outcomes/government", roles: ["admin"] },
  { path: "/api/v1/outcomes/institute", roles: ["institute", "admin"] },
  { path: "/api/v1/kpis/overview", roles: ["admin", "institute", "trainee"] },
  { path: "/api/v1/kpis/center-standing", roles: ["institute"] }, // INST-04: center dashboard standing
  { path: "/api/v1/followups", roles: ["admin"] }, // INST-01: gov-authority surface
  { path: "/api/v1/conflicts", roles: ["admin"] }, // INST-01: gov-authority surface
  { path: "/api/v1/audit-logs", roles: ["admin"] }, // INST-01: gov-authority surface
  { path: "/api/v1/trainees", roles: ["admin", "institute"], publicMethods: ["POST"] }, // GET center-scoped for institutes; POST = public self-signup
  { path: "/api/v1/cohorts", roles: ["admin", "institute"] },
  { path: "/api/v1/demo", roles: ["admin", "institute"] },
  { path: "/api/v1/employer/me", roles: ["employer", "admin"] },
  { path: "/api/v1/employer/jobs", roles: ["employer", "admin"] }, // F25 job CRUD + applicants
  { path: "/api/v1/trainee/me", roles: ["trainee"] },
  { path: "/api/v1/trainee/recommendations", roles: ["trainee"] },
  { path: "/api/v1/trainee/jobs", roles: ["trainee"] }, // F25 job board browse + apply
  { path: "/api/v1/trainee/applications", roles: ["trainee"] }, // F25 my applications + withdraw
  { path: "/api/v1/trainee/job-seek-signal", roles: ["trainee"] }, // F25 can't-find-a-job signal
  { path: "/api/v1/admin/employers", roles: ["admin"] }, // F25 verification queue + suspend
];

/** Role-aware home page after login. */
export const roleHomeRoutes: Record<UserRole, string> = {
  admin: "/admin/analytics",
  institute: "/institute/analytics",
  employer: "/employer/dashboard",
  trainee: "/dashboard",
};

/** Whether `path` is accessible for `role` — undefined routes are open. */
export function isPathAllowedForRole(path: string, role: UserRole): boolean {
  const routeConfig = protectedRoutes.find((route) => path.startsWith(route.path));
  if (!routeConfig) return true;
  return routeConfig.roles.includes(role);
}
