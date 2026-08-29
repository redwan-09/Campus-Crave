import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE, ROLE_HOME } from "@/lib/auth";

const PROTECTED_PREFIXES: Record<string, string[]> = {
  "/student": ["student"],
  "/canteen": ["canteen_manager"],
  "/admin": ["admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(PROTECTED_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!matchedPrefix) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE.name)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedRoles = PROTECTED_PREFIXES[matchedPrefix];
  if (!allowedRoles.includes(session.role)) {
    // Logged in, but wrong role for this area — send them home instead.
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/canteen/:path*", "/admin/:path*"],
};
