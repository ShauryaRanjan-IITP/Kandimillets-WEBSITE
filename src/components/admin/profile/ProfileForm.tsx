"use client";

/** Update Name / Update Email — this task's §4. Same inline-card
 * convention as BusinessSettingsForm.tsx (no modal, exactly one thing to
 * edit per page). */
import { useState } from "react";
import { updateProfile } from "@/app/admin/(app)/profile/actions";
import type { UserDTO } from "@/lib/users/dto";

interface ProfileFormProps {
  user: UserDTO;
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const result = await updateProfile({ name, email });
    setSubmitting(false);

    if (result.status === "success") {
      setName(result.user.name);
      setEmail(result.user.email);
      setSuccess(true);
      return;
    }
    setError(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card space-y-5 p-6 md:p-8">
      <h2 className="font-heading text-sm font-semibold text-brown-900">Account Details</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Name <span className="text-red-500">*</span>
          </label>
          <input id="profile-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="profile-email" className={labelClass}>
            Email <span className="text-red-500">*</span>
          </label>
          <input id="profile-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Profile updated.
        </div>
      )}

      <div className="flex items-center justify-end border-t border-warm-200 pt-5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
