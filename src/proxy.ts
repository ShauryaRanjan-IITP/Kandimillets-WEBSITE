import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes under /admin that must remain reachable without a session.
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

// Fast cookie *presence* check (no DB round trip). `getSessionCookie`
// only parses the request cookies and returns the token string if the
// cookie is present — it does NOT verify the signature, expiry, or the
// underlying DB session. So presence is a one-way signal: its ABSENCE is
// definitive ("cannot possibly be authenticated" — safe to redirect to
// login), but its PRESENCE proves nothing (the session may be expired,
// revoked, or belong to a now-inactive user). Pages/layouts re-verify the
// full session server-side (requireAdminSession) as the authoritative
// check.
//
// Because presence is not authority, this proxy deliberately makes only
// the protective decision (no cookie on a protected path -> login) and
// NEVER the inverse "you look logged in, go to dashboard" redirect on a
// public path. Doing the latter here caused a redirect loop: a
// present-but-invalid cookie made the proxy bounce /admin/login ->
// /admin/dashboard, while AdminAppLayout's authoritative getSession()
// correctly rejected the stale cookie and redirected /admin/dashboard ->
// /admin/login, ping-ponging until ERR_TOO_MANY_REDIRECTS (document
// requests) or an endless RSC re-fetch hang (client navigation). Public
// admin paths therefore always pass through untouched.
//
// Wrapped in try/catch as this task's hardening pass — `getSessionCookie`
// has no known throwing case today, but middleware sits in front of every
// /admin request with no error boundary of its own, so an exception here
// must fail closed rather than let the request fall through to
// `NextResponse.next()` by accident of an unhandled throw.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublicAdminPath) {
    return NextResponse.next();
  }

  let sessionCookie: string | null = null;
  try {
    sessionCookie = getSessionCookie(request);
  } catch (error) {
    console.error("proxy: session cookie check failed, treating as unauthenticated.", error);
    sessionCookie = null;
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

// Scoped strictly to /admin so the public site is never touched by this
// proxy — matches the isolation requirement from the architecture.
export const config = {
  matcher: ["/admin/:path*"],
};
