import NextAuth from "next-auth";
import { authConfig, protectedRoutes } from "~/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const role = req.auth?.user?.role;
  const routeConfig = protectedRoutes.find((route) =>
    req.nextUrl.pathname.startsWith(route.path)
  );

  if (!routeConfig) return NextResponse.next();
  if (role && routeConfig.roles.includes(role)) return NextResponse.next();

  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
  if (role) loginUrl.searchParams.set("error", "unauthorized");
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/institute/:path*",
    "/employer/:path*",
    "/auth/trainee/:path*",
    "/trainees/:path*",
    "/dashboard/:path*",
  ],
};
