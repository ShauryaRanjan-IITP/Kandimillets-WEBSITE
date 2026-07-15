import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes under /admin that must remain reachable without a session.
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

// Fast cookie presence/signature check (no DB round trip). Pages
// re-verify the full session server-side (see admin/dashboard) as
// defense-in-depth, since a valid-looking cookie doesn't guarantee the
// underlying session/user is still active.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const sessionCookie = getSessionCookie(request);

  if (isPublicAdminPath) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
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
