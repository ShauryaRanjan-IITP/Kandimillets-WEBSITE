"use client";

/**
 * Reset Password form — this task's §6 UX requirements: clear validation
 * (including a client-side "passwords match" check, since that costs
 * nothing to check before hitting the server), a loading state, and an
 * inline success state that doubles as the "Reset Password success page"
 * requirement — shown in place, with a clear "Return to Login" link,
 * rather than a separate route/redirect for what is fundamentally the
 * same screen's next state.
 *
 * Calls `authClient.resetPassword()` directly (Better Auth's client
 * SDK) rather than a custom Server Action — see
 * src/app/admin/reset-password/actions.ts's module comment for why a
 * direct `auth.api.resetPassword()` server-side call was found (during
 * manual testing) to bypass rate limiting. On failure, this still
 * reports the attempt to that Server Action purely for audit logging.
 */
import { useId, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { reportFailedPasswordReset } from "@/app/admin/reset-password/actions";

interface ResetPasswordFormProps {
  token: string;
}

const GENERIC_ERROR_MESSAGE = "This reset link is invalid or has expired. Please request a new one.";

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const passwordId = useId();
  const confirmId = useId();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword, token });
    setIsPending(false);

    if (resetError) {
      await reportFailedPasswordReset(token);
      setError(GENERIC_ERROR_MESSAGE);
      return;
    }
    setSuccessMessage("Your password has been reset. You can now sign in with your new password.");
  }

  if (successMessage) {
    return (
      <div className="space-y-5">
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
        <Link
          href="/admin/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor={passwordId} className="mb-1.5 block text-sm font-medium text-brown-700">
          New Password
        </label>
        <input
          type="password"
          id={passwordId}
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "reset-password-error" : undefined}
          className="w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-2.5 text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />
      </div>

      <div>
        <label htmlFor={confirmId} className="mb-1.5 block text-sm font-medium text-brown-700">
          Confirm New Password
        </label>
        <input
          type="password"
          id={confirmId}
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "reset-password-error" : undefined}
          className="w-full rounded-xl border border-warm-300 bg-warm-50 px-4 py-2.5 text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />
      </div>

      {error && (
        <div id="reset-password-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-green-300"
      >
        {isPending ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
