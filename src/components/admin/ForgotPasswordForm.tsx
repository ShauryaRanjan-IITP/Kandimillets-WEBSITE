"use client";

/**
 * Forgot Password form — this task's §6 UX requirements: clear
 * validation, a loading state, and (critically) no user enumeration —
 * the exact same success message renders whether or not the email is
 * registered, matching the LoginForm.tsx's existing field/button/error
 * chrome rather than inventing new form styling.
 *
 * Calls Better Auth's own client SDK directly (`authClient.requestPasswordReset`),
 * the same pattern LoginForm.tsx already uses for `signIn.email()` —
 * deliberately *not* a custom Server Action wrapping `auth.api.*`.
 * Verified during manual testing that `auth.api.requestPasswordReset()`
 * called in-process from a Server Action bypasses Better Auth's
 * rate-limiting middleware entirely (that middleware is wired at the
 * HTTP-request layer, not the in-process `auth.api.*` call layer) — a
 * real client-side fetch through `/api/auth/request-password-reset` is
 * what the rate limiter (src/lib/auth/auth.ts's `rateLimit.customRules`)
 * actually protects.
 */
import { useId, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for that email address, we've sent instructions to reset your password.";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = email.trim();
    // A malformed-email check is safe to answer honestly — it's a
    // syntax fact the visitor already typed, not a statement about any
    // account. Everything past this point always resolves to the same
    // generic message, whatever Better Auth's response actually was —
    // see this task's "Never reveal whether an email exists."
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsPending(true);
    await authClient.requestPasswordReset({
      email: trimmed,
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setIsPending(false);
    setSuccessMessage(GENERIC_SUCCESS_MESSAGE);
  }

  if (successMessage) {
    return (
      <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-brown-700">
          Email
        </label>
        <input
          type="email"
          id={emailId}
          name="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@kandimillets.com"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${emailId}-error` : undefined}
          className="w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-2.5 text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />
      </div>

      {error && (
        <div id={`${emailId}-error`} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-green-300"
      >
        {isPending ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
