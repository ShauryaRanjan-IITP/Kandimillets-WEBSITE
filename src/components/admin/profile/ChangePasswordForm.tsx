"use client";

/** Change Password — this task's §4. */
import { useState } from "react";
import { changeOwnPassword } from "@/app/admin/(app)/profile/actions";

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const result = await changeOwnPassword({ currentPassword, newPassword });
    setSubmitting(false);

    if (result.status === "success") {
      setCurrentPassword("");
      setNewPassword("");
      setSuccess(true);
      return;
    }
    setError(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card space-y-5 p-6 md:p-8">
      <h2 className="font-heading text-sm font-semibold text-brown-900">Change Password</h2>
      <p className="text-xs text-brown-500">
        Changing your password signs you out everywhere, including here — you&apos;ll need to sign in again with
        your new password.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="change-password-current" className={labelClass}>
            Current Password <span className="text-red-500">*</span>
          </label>
          <input
            id="change-password-current"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="change-password-new" className={labelClass}>
            New Password <span className="text-red-500">*</span>
          </label>
          <input
            id="change-password-new"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Password changed.
        </div>
      )}

      <div className="flex items-center justify-end border-t border-warm-200 pt-5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Change Password
        </button>
      </div>
    </form>
  );
}
