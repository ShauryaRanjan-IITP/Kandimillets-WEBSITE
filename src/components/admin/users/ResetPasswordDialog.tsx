"use client";

/** Reset Password (admin-initiated, on behalf of another user) — this
 * task's explicit "Reset Password" User Management feature. */
import { useState } from "react";

interface ResetPasswordDialogProps {
  userName: string;
  onClose: () => void;
  onConfirm: (newPassword: string) => void | Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";

export default function ResetPasswordDialog({ userName, onClose, onConfirm, submitting = false, submitError = null }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    await onConfirm(password);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto p-6">
        <h2 className="font-heading text-lg font-bold text-brown-900">Reset Password for {userName}</h2>
        <p className="mt-2 text-sm text-brown-500">
          This immediately signs the user out of every active session. They&apos;ll need to sign in again with this
          new password.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="reset-password-new" className="mb-1.5 block text-sm font-medium text-brown-700">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              id="reset-password-new"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>

          {(error || submitError) && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error ?? submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-warm-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-brown-300 px-5 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
