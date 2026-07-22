"use server";

/**
 * Reset Password — audit-only Server Action. The actual password reset
 * is performed client-side via `authClient.resetPassword()`
 * (src/components/admin/ResetPasswordForm.tsx), the same
 * "call Better Auth's client SDK directly" pattern LoginForm.tsx and
 * ForgotPasswordForm.tsx already use — verified during manual testing
 * that calling `auth.api.resetPassword()` in-process from a Server
 * Action bypasses Better Auth's HTTP-layer rate-limiting middleware,
 * so the client must make a real request through `/api/auth/reset-password`
 * for the rate limit (src/lib/auth/auth.ts's `rateLimit.customRules`) to
 * actually apply.
 *
 * This action's only job is Audit Logs §5's "Failed reset attempts
 * (where appropriate)" — the client calls it after its own
 * `authClient.resetPassword()` call fails. The read here
 * (`prisma.verification.findFirst`) is read-only and never consumes the
 * token — Better Auth's own `resetPassword` endpoint (already called by
 * the client, and already failed by the time this runs) remains the
 * sole authority on validating/consuming it. "Where appropriate" means:
 * a token that never resolved to any real, live verification record
 * can't be safely attributed to a specific user, so that case is logged
 * to the server console only, never the Audit Log — this avoids
 * inventing a fake "actor" in an otherwise-trustworthy audit trail.
 */
import prisma from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/audit/log";

export async function reportFailedPasswordReset(token: string): Promise<void> {
  if (!token) return;

  const verification = await prisma.verification.findFirst({
    where: { identifier: `reset-password:${token}` },
    select: { value: true },
  });

  if (!verification) {
    console.warn("reportFailedPasswordReset: token did not resolve to a known verification record.");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: verification.value },
    select: { id: true, name: true, email: true },
  });
  if (!user) return;

  await writeAuditLog({
    userId: user.id,
    userName: user.name,
    action: "PASSWORD_RESET_FAILED",
    entityType: "USER",
    entityId: user.id,
    reference: user.email,
    summary: `${user.name}'s password reset attempt failed (invalid state or rejected password).`,
  });
}
