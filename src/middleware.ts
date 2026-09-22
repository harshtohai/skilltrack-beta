import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  { path: "/admin", roles: ["admin"] },
  { path: "/institute", roles: ["institute", "admin"] },
  { path: "/employer", roles: ["employer", "admin"] },
  { path: "/auth/trainee", roles: ["trainee"] },
];

const publicRoutes = ["/", "/login", "/signup", "/api/v1/auth/trainee/verify", "/api/v1/trainee/magic-link"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("outcometrack_auth");
  const userRole = authCookie?.value;

  if (!userRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const routeConfig = protectedRoutes.find((route) => pathname.startsWith(route.path));
  if (routeConfig && !routeConfig.roles.includes(userRole)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/institute/:path*",
    "/employer/:path*",
    "/auth/trainee/:path*",
  ],
};