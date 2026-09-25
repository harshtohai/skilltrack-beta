import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

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
  { path: "/api/v1/analytics/government", roles: ["admin"] },
  { path: "/api/v1/analytics/institute", roles: ["institute", "admin"] },
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

// Public by design: auth pages, passwordless entry points, and API routes
// that carry their own credential (API key, HMAC, one-time token).
export const publicRoutes = [
  "/login",
  "/signup",
  "/terms",
  "/privacy",
  "/employer/login",
  "/simulator",
  "/api/v1/health",
  "/api/v1/auth", // legacy role logins + trainee magic-link verify (token = credential)
  "/api/v1/trainee/magic-link", // issues the one-time token
  "/api/v1/bot", // X-API-Key gated in-route
  "/api/v1/verification", // employer claim verification (token = credential)
];

/** "/" must match exactly — startsWith("/") would make every path public. */
export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return publicRoutes.some((route) => pathname.startsWith(route));
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role: UserRole;
    };
  }
  interface User {
    role: UserRole;
  }
}

/**
 * Edge-safe auth config (no Prisma) — used by middleware for route
 * protection and shared with the full auth instance.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = (token.role as UserRole) ?? "trainee";
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (isPublicPath(pathname)) {
        return true;
      }

      const role = auth?.user?.role;
      const routeConfig = protectedRoutes.find((route) => pathname.startsWith(route.path));
      if (!routeConfig) return true;

      if (role && routeConfig.roles.includes(role)) return true;

      return false;
    },
  },
} satisfies NextAuthConfig;
