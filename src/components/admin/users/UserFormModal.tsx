"use client";

/**
 * Create/Edit User — one reusable modal for both flows, matching
 * RetailerFormModal.tsx's exact chrome/field conventions. Password is
 * only ever collected here on Create — editing an existing user never
 * touches their password (that's Reset Password's own dialog).
 */
import { useState } from "react";
import type { AdminRole, CreateUserFormValues, UserFormValues } from "./types";

interface UserFormModalProps {
  onClose: () => void;
  onSubmit: (values: CreateUserFormValues) => void | Promise<void>;
  initialValues?: UserFormValues;
  submitting?: boolean;
  submitError?: string | null;
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

export default function UserFormModal({ onClose, onSubmit, initialValues, submitting = false, submitError = null }: UserFormModalProps) {
  const isEdit = Boolean(initialValues);
  const [values, setValues] = useState<CreateUserFormValues>({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    role: initialValues?.role ?? "ADMIN",
    isActive: initialValues?.isActive ?? true,
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CreateUserFormValues>(key: K, value: CreateUserFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!values.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!isEdit && values.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    await onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card w-full max-w-lg p-6 md:p-8">
        <div className="flex items-start justify-between border-b border-warm-200 pb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-brown-900">{isEdit ? "Edit User" : "Add User"}</h2>
            <p className="mt-1 text-sm text-brown-500">
              {isEdit ? "Update this user's details." : "Name, Email, and Password are required."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-brown-400 transition-colors hover:bg-warm-100 hover:text-brown-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="user-name" className={labelClass}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="user-name"
                type="text"
                required
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="user-email" className={labelClass}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="user-email"
                type="email"
                required
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="user-role" className={labelClass}>
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="user-role"
                required
                value={values.role}
                onChange={(e) => update("role", e.target.value as AdminRole)}
                className={inputClass}
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="user-status" className={labelClass}>
                Status
              </label>
              <select
                id="user-status"
                value={values.isActive ? "active" : "inactive"}
                onChange={(e) => update("isActive", e.target.value === "active")}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {!isEdit && (
              <div className="sm:col-span-2">
                <label htmlFor="user-password" className={labelClass}>
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="user-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {(error || submitError) && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error ?? submitError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-warm-200 pt-5">
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
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
