import type { NextAuthConfig } from "next-auth";
import { protectedRoutes, type UserRole } from "~/lib/protected-routes";

export { protectedRoutes } from "~/lib/protected-routes";
export type { UserRole } from "~/lib/protected-routes";

// Public by design: auth pages, passwordless entry points, and API routes
// that carry their own credential (API key, HMAC, one-time token).
export const publicRoutes = [
  "/login",
  "/signup",
  "/terms",
  "/privacy",
  "/employer/login",
  "/employer/register", // unlisted employer signup (F25) — direct URL only, never linked
  "/simulator",
  "/api/v1/health",
  "/api/v1/auth", // legacy role logins + trainee magic-link verify (token = credential)
  "/api/v1/employer/register", // unlisted employer signup (F25) — credential = submitted form
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
      instituteCenterId?: string | null;
    };
  }
  interface User {
    role: UserRole;
    instituteCenterId?: string | null;
  }
}

/**
 * Edge-safe auth config (no Prisma) — used by middleware for route
 * protection and shared with the full auth instance.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = (token.role as UserRole) ?? "trainee";
      session.user.instituteCenterId = (token.instituteCenterId as string | undefined) ?? null;
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
