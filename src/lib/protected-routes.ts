// Pure data — safe to import from client components and middleware/edge.
// Mirrors src/lib/auth.config.ts (which re-exports it) and used by the
// login page to validate post-login redirects per role.

export type UserRole = "admin" | "institute" | "employer" | "trainee";

export const protectedRoutes: { path: string; roles: UserRole[] }[] = [
  // Pages — order matters: "/trainees" must precede "/trainee" (startsWith).
  { path: "/admin", roles: ["admin"] },
  { path: "/institute", roles: ["institute", "admin"] },
  { path: "/employer", roles: ["employer", "admin"] },
  { path: "/trainees", roles: ["admin", "institute"] },
  { path: "/trainee", roles: ["trainee"] },
  { path: "/dashboard", roles: ["admin", "institute", "trainee"] },
  { path: "/followups", roles: ["admin", "institute"] },
  { path: "/cohorts", roles: ["admin", "institute"] },
  { path: "/conflicts", roles: ["admin", "institute"] },
  { path: "/audit-logs", roles: ["admin", "institute"] },
  // API — server-side data endpoints. Client pages fetch these with the
  // session cookie, so edge pre-checks don't break them.
  { path: "/api/v1/outcomes/government", roles: ["admin"] },
  { path: "/api/v1/outcomes/institute", roles: ["institute", "admin"] },
  { path: "/api/v1/kpis/overview", roles: ["admin", "institute", "trainee"] },
  { path: "/api/v1/followups", roles: ["admin", "institute"] },
  { path: "/api/v1/conflicts", roles: ["admin", "institute"] },
  { path: "/api/v1/audit-logs", roles: ["admin", "institute"] },
  { path: "/api/v1/trainees", roles: ["admin", "institute"] },
  { path: "/api/v1/cohorts", roles: ["admin", "institute"] },
  { path: "/api/v1/demo", roles: ["admin", "institute"] },
  { path: "/api/v1/employer/me", roles: ["employer", "admin"] },
  { path: "/api/v1/trainee/me", roles: ["trainee"] },
  { path: "/api/v1/trainee/recommendations", roles: ["trainee"] },
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
