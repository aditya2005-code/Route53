import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_KEY = "route53_jwt_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname === "/login" ||
    pathname === "/register";

  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/hosted-zones") ||
    pathname.startsWith("/troubleshoot") ||
    pathname.startsWith("/traffic-policies") ||
    pathname.startsWith("/health-checks") ||
    pathname.startsWith("/resolver") ||
    pathname.startsWith("/profiles") ||
    pathname.startsWith("/settings");

  // 1. If unauthenticated and trying to access protected route -> redirect to /auth/login
  if (!token && isProtectedPage) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already authenticated and trying to access login/register -> redirect to /dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hosted-zones/:path*",
    "/troubleshoot/:path*",
    "/traffic-policies/:path*",
    "/health-checks/:path*",
    "/resolver/:path*",
    "/profiles/:path*",
    "/settings/:path*",
    "/auth/login",
    "/auth/register",
    "/login",
    "/register",
  ],
};
