import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the token key string directly to avoid potential browser/server module resolve issues
const TOKEN_KEY = "route53_jwt_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  // Redirect root path requests based on authentication token
  if (pathname === "/") {
    const destination = token ? "/hosted-zones" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/auth/login");
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/hosted-zones");

  // 1. If unauthenticated and trying to access protected route -> redirect to /login
  if (!token && isProtectedPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated and trying to access login page -> redirect to /hosted-zones
  if (token && isAuthPage) {
    const hostedZonesUrl = new URL("/hosted-zones", request.url);
    return NextResponse.redirect(hostedZonesUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/hosted-zones/:path*",
    "/login",
    "/auth/login",
  ],
};
