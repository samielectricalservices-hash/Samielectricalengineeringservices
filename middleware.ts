import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityHeaders } from "@/lib/security";

const SESSION_COOKIE_NAME = "msms.session";

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isAuthenticated = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (!isAuthenticated && request.nextUrl.pathname !== "/login") {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|uploads).*)"]
};
