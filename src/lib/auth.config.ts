import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export type UserRole = "admin" | "institute" | "employer" | "trainee";

export const protectedRoutes: { path: string; roles: UserRole[] }[] = [
  { path: "/admin", roles: ["admin"] },
  { path: "/institute", roles: ["institute", "admin"] },
  { path: "/employer", roles: ["employer", "admin"] },
  // /auth/trainee/* stays public: the one-time magic-link token is the
  // credential; the verify endpoint mints the session after verification.
];

const publicRoutes = ["/", "/login", "/signup", "/api", "/terms", "/privacy"];

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

      if (publicRoutes.some((route) => pathname.startsWith(route))) {
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
