/**
 * Shared, fail-closed session helpers — the single place every admin
 * Server Component, Server Action, and Route Handler goes through to
 * check "who is signed in," replacing ~20 previously-duplicated inline
 * `auth.api.getSession({headers: await headers()})` call sites.
 *
 * Root cause this exists to fix (see the Authentication Hardening task's
 * Implementation Report for the full write-up): Better Auth's
 * `getSession` endpoint does not only resolve to `null` for "no session" —
 * it can also *throw* an `APIError` (see
 * node_modules/better-auth/dist/api/routes/session.mjs's catch block,
 * and the explicit "concurrent deletion" / session-refresh-collision
 * throw a few lines above it — a real race exercised by exactly the
 * "multiple tabs" scenario this task asked to test). The previous code
 * in every call site only handled the `!session` case
 * (`if (!session) redirect(...)`) and had no `try/catch` at all, so a
 * thrown error skipped the redirect entirely and propagated as an
 * uncaught exception out of a Server Component — which is not
 * guaranteed to render as a safe redirect (no `error.tsx` boundary
 * existed anywhere in this app before this task), and could allow a
 * brief flash of the protected layout while Next.js's default error
 * recovery took over. Every helper below treats "session lookup threw"
 * and "session lookup returned null" completely identically, which is
 * what makes this fail *closed* rather than merely fail *usually*.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/** Next.js's own internal control-flow signals (thrown by `headers()`
 * during static-generation bail-out, by `redirect()`, by `notFound()`)
 * are not real failures — catching and swallowing one here would corrupt
 * Next's rendering pipeline instead of protecting anything. Verified via
 * `npm run build`: without this check, the build log filled with
 * "session lookup failed" for every route that legitimately needed to
 * opt into dynamic rendering, because `getSessionSafe`'s own `try` block
 * was catching that opt-in signal and misreporting it as an auth error. */
function isNextInternalControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: string } | null)?.digest;
  return digest === "DYNAMIC_SERVER_USAGE" || digest === "NEXT_REDIRECT" || digest === "NEXT_NOT_FOUND";
}

/**
 * Never throws (except to re-propagate Next.js's own internal control-
 * flow signals, which must never be swallowed). Resolves to `null` both
 * when there genuinely is no session and when the session lookup itself
 * failed for any other reason (a thrown APIError, a transient database
 * error, anything) — callers must not, and structurally cannot,
 * distinguish the two, which is the point: an error while checking auth
 * must never be treated as "logged in" or allowed to skip whatever
 * unauthenticated-path handling the caller has.
 */
export async function getSessionSafe(): Promise<AdminSession | null> {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    if (isNextInternalControlFlowError(error)) {
      throw error;
    }
    // Deliberately no request/cookie/token detail in this log line — see
    // this task's "no sensitive logging" security requirement. A thrown
    // error object from Better Auth can be logged as-is (it's a
    // structured APIError, not raw cookie/session data).
    console.error("getSessionSafe: session lookup failed, treating as unauthenticated.", error);
    return null;
  }
}

/**
 * For Server Components (pages, layouts) only. Guarantees one of two
 * outcomes: a real, verified session is returned, or execution never
 * continues past this call — `redirect("/admin/login")` throws Next.js's
 * internal redirect signal, which unwinds the component before it can
 * render any protected markup. Never lets a session-lookup exception
 * propagate past this point.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getSessionSafe();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
