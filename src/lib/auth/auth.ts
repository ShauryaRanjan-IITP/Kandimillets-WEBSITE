import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/audit/log";
import { sendPasswordResetEmail } from "@/lib/email/sendPasswordResetEmail";

// Kept in one place so the email template (which states "expires in N
// minutes") and Better Auth's own token expiry can never drift apart.
const RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS = 60 * 60;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  // Origin validation (Better Auth's own CSRF-adjacent origin-check
  // middleware, src/api/middlewares/origin-check.mjs) only ever trusts
  // exactly two things by default: the origin derived from `baseURL`
  // above, and whatever is listed here — see
  // node_modules/better-auth/dist/context/helpers.mjs's getTrustedOrigins.
  // `BETTER_AUTH_URL` is one fixed string per environment, but Vercel
  // Preview deployments each get a unique, unpredictable URL
  // (<project>-<hash>-<team>.vercel.app) that can never match a single
  // static value — that mismatch is exactly what produced INVALID_ORIGIN
  // on Preview. `VERCEL_URL` is set by Vercel itself, per deployment, at
  // build/runtime — including on every Preview build — so this trusts
  // only the exact origin of whichever deployment is actually running,
  // never a wildcard/blanket vercel.app allowance.
  //
  // `www.kandimillets.com` and `kandimillets.com` are different origins
  // as far as this exact-match check is concerned, even though they're
  // the same site — BETTER_AUTH_URL only covers one of them, so the
  // other has to be listed explicitly or requests made from it (e.g. the
  // password-reset redirectTo built from window.location.origin) fail
  // with INVALID_REDIRECT_URL.
  trustedOrigins: [
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    "https://kandimillets.com",
    "https://www.kandimillets.com",
  ],

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // No public registration, ever — admins are provisioned only via the
  // seed script (Phase 1) or, from this phase on, the User Management
  // module (src/app/admin/(app)/users/actions.ts).
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    // No `password.hash` / `password.verify` override: Better Auth's
    // own maintained hashing implementation (scrypt) is used as-is.

    // Password Recovery (Authentication Hardening task, §2) — Better
    // Auth's own built-in reset-password flow, per that task's explicit
    // "if Better Auth already provides a supported mechanism, use it
    // instead of creating custom token logic" instruction. This is not
    // custom token logic: one-time tokens, expiry, and "used tokens
    // become invalid" are all handled internally by Better Auth via the
    // existing `Verification` table (reserved but unused since Phase 1 —
    // see docs/ADMIN_SYSTEM.md §6) — `consumeVerificationValue` deletes
    // the row on first successful use, and `findVerificationValue`'s
    // expiry check rejects a stale token before that. This callback is
    // only the delivery step: build and send the email. It deliberately
    // never throws (see sendPasswordResetEmail/sendEmail) so a delivery
    // failure can never surface a different response shape than the
    // generic "if this email exists..." message the request-password-
    // reset endpoint already always returns (no enumeration).
    async sendResetPassword(data) {
      // Audit Logs (§5) — "Password reset requested." This callback only
      // ever runs for a real, matched user (Better Auth's own endpoint
      // looks the user up before calling it, and does nothing — no call,
      // no audit entry — for an email that doesn't exist), so logging
      // here can never itself become an enumeration side-channel visible
      // to the requester; it's purely an internal record for whoever
      // reviews the Audit Log page later.
      await writeAuditLog({
        userId: data.user.id,
        userName: data.user.name,
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "USER",
        entityId: data.user.id,
        reference: data.user.email,
        summary: `${data.user.name} requested a password reset email.`,
      });
      await sendPasswordResetEmail({
        to: data.user.email,
        recipientName: data.user.name,
        resetUrl: data.url,
        expiresInMinutes: RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS / 60,
      });
    },
    resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_EXPIRES_IN_SECONDS,

    // A completed password reset invalidates every existing session for
    // that user — the same "force re-authentication everywhere" guarantee
    // already given by the Super-Admin-initiated resetUserPassword and
    // self-service changeOwnPassword actions (src/app/admin/(app)/users
    // /actions.ts, src/app/admin/(app)/profile/actions.ts).
    revokeSessionsOnPasswordReset: true,

    // Audit Logs (§5) — "Password reset completed." No `before` hook
    // exists for a failed *token* attempt (invalid/expired/already used)
    // at this layer; that's audited instead in
    // src/app/admin/reset-password/actions.ts, which is this app's own
    // Server Action wrapping `auth.api.resetPassword` and is the only
    // code path that can observe *why* an attempt failed.
    async onPasswordReset({ user }) {
      await writeAuditLog({
        userId: user.id,
        userName: user.name,
        action: "PASSWORD_RESET",
        entityType: "USER",
        entityId: user.id,
        reference: user.email,
        summary: `${user.name} completed a password reset via the emailed link.`,
      });
    },
  },

  // Password Recovery abuse prevention (§4 "Password reset abuse") — the
  // two reset endpoints are the most attractive brute-force/enumeration
  // targets in the whole auth surface, so they get materially tighter
  // limits than Better Auth's global default (100 requests/10s). Reusing
  // Better Auth's own rate limiter (its documented `customRules` config
  // point) rather than hand-rolling a second in-memory limiter next to
  // the one already flagged as a known weakness for the public inquiry
  // form (ARCHITECTURE.md §11) — this is "reuse existing authentication,"
  // not a new mechanism. `enabled: true` unconditionally (not just in
  // production) so this is exercised in every environment, including the
  // manual verification this task requires.
  rateLimit: {
    enabled: true,
    customRules: {
      // Registered both with and without the `/api/auth` mount prefix —
      // verified empirically (manual testing showed the prefix-less key
      // alone never matched) that Better Auth's rate limiter resolves
      // the request path inconsistently with what its own
      // `normalizePathname` doc comment implies, so both forms are kept
      // rather than relying on a single assumed path shape.
      "/request-password-reset": { window: 15 * 60, max: 3 },
      "/api/auth/request-password-reset": { window: 15 * 60, max: 3 },
      "/reset-password": { window: 15 * 60, max: 10 },
      "/api/auth/reset-password": { window: 15 * 60, max: 10 },
    },
  },

  // Session defaults (7-day expiry, refreshed on use) already implement
  // the "remember session" behavior requested for this phase.
  session: {},

  // Exposes the admin-portal fields already on the Prisma `User` model
  // (docs/ADMIN_SYSTEM.md §6) through Better Auth's own session/user
  // payload — without this, `role`/`isActive`/`lastLoginAt` exist in the
  // database but `auth.api.getSession()` never returns them, which is
  // exactly why role/isActive enforcement could never be wired in before
  // this phase. `input: false` on every field means none of them can ever
  // be set via a client-supplied sign-up/update payload (moot today since
  // sign-up is disabled, but a deliberate belt-and-suspenders match for
  // "never trust client-computed values," docs/API.md §2).
  user: {
    additionalFields: {
      role: { type: ["SUPER_ADMIN", "ADMIN"], required: false, defaultValue: "ADMIN", input: false },
      isActive: { type: "boolean", required: false, defaultValue: true, input: false },
      lastLoginAt: { type: "date", required: false, input: false },
    },
  },

  // Enforces `User.isActive` at the moment a session is actually created
  // (i.e. on every successful login) and captures the login itself —
  // both were explicitly reserved-but-unenforced fields per
  // docs/ADMIN_SYSTEM.md §7/§11 ("Inactive user... not enforced anywhere
  // today") until this final Administration phase, which is what makes
  // "Activate/Deactivate User" an actual access control rather than a
  // cosmetic flag. `databaseHooks` — not a hand-rolled wrapper around
  // `signIn.email()` — is Better Auth's own supported extension point for
  // exactly this, so the existing LoginForm/signIn.email() client call is
  // left completely untouched (docs/API.md "do not redesign").
  databaseHooks: {
    session: {
      create: {
        async before(session) {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true },
          });
          // A generic false (not a distinguishing error) — the client
          // sees the same "Invalid email or password" outcome either
          // way, per the existing no-enumeration principle
          // (docs/ADMIN_SYSTEM.md §4).
          if (!user || !user.isActive) {
            return false;
          }
          return true;
        },
        async after(session) {
          const user = await prisma.user.update({
            where: { id: session.userId },
            data: { lastLoginAt: new Date() },
            select: { name: true },
          });
          await writeAuditLog({
            userId: session.userId,
            userName: user.name,
            action: "LOGIN",
            entityType: "SESSION",
            entityId: session.id,
            summary: `${user.name} signed in.`,
          });
        },
      },
      delete: {
        async after(session) {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { name: true },
          });
          if (!user) return;
          await writeAuditLog({
            userId: session.userId,
            userName: user.name,
            action: "LOGOUT",
            entityType: "SESSION",
            entityId: session.id,
            summary: `${user.name} signed out.`,
          });
        },
      },
    },
  },

  advanced: {
    // Cookies are httpOnly by default and become `Secure` automatically
    // in production; this only widens that guarantee to every environment
    // so local/staging behave identically to production.
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  // Required so Server Actions/Route Handlers can set the session cookie.
  // Must be the last plugin per Better Auth's Next.js integration.
  plugins: [nextCookies()],
});
