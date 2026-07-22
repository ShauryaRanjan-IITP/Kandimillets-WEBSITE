"use client";

/**
 * Create/Edit Retailer — one reusable modal for both flows (this task's
 * explicit "Edit Retailer: reuse the same modal" requirement), matching
 * AddSaleModal.tsx's exact chrome/field conventions (input classes,
 * overlay, spinner) rather than inventing new modal styling.
 */
import { useState } from "react";
import type { RetailerFormValues } from "./types";
import { emptyRetailerFormValues } from "./types";

interface RetailerFormModalProps {
  onClose: () => void;
  onSubmit: (values: RetailerFormValues) => void | Promise<void>;
  initialValues?: RetailerFormValues;
  submitting?: boolean;
  submitError?: string | null;
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

export default function RetailerFormModal({
  onClose,
  onSubmit,
  initialValues,
  submitting = false,
  submitError = null,
}: RetailerFormModalProps) {
  const isEdit = Boolean(initialValues);
  const [values, setValues] = useState<RetailerFormValues>(initialValues ?? emptyRetailerFormValues);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof RetailerFormValues>(key: K, value: RetailerFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Business Name is required.");
      return;
    }
    if (!values.phone.trim()) {
      setError("Phone is required.");
      return;
    }
    if (!values.city.trim() || !values.state.trim()) {
      setError("City and State are required.");
      return;
    }

    await onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card w-full max-w-2xl p-6 md:p-8">
        <div className="flex items-start justify-between border-b border-warm-200 pb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-brown-900">{isEdit ? "Edit Retailer" : "Add Retailer"}</h2>
            <p className="mt-1 text-sm text-brown-500">
              {isEdit ? "Update this retailer's details." : "Business Name and Phone are required."}
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
              <label htmlFor="retailer-name" className={labelClass}>
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                id="retailer-name"
                type="text"
                required
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="retailer-contact-person" className={labelClass}>
                Contact Person
              </label>
              <input
                id="retailer-contact-person"
                type="text"
                value={values.contactPerson}
                onChange={(e) => update("contactPerson", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="retailer-phone" className={labelClass}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="retailer-phone"
                type="tel"
                required
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="e.g. 9876543210"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="retailer-alternate-phone" className={labelClass}>
                Alternate Phone
              </label>
              <input
                id="retailer-alternate-phone"
                type="tel"
                value={values.alternatePhone}
                onChange={(e) => update("alternatePhone", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="retailer-email" className={labelClass}>
                Email
              </label>
              <input
                id="retailer-email"
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="retailer-gstin" className={labelClass}>
                GST Number
              </label>
              <input
                id="retailer-gstin"
                type="text"
                value={values.gstin}
                onChange={(e) => update("gstin", e.target.value)}
                placeholder="15-character GSTIN"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="retailer-address" className={labelClass}>
                Address
              </label>
              <input
                id="retailer-address"
                type="text"
                value={values.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="retailer-city" className={labelClass}>
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="retailer-city"
                type="text"
                required
                value={values.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="retailer-state" className={labelClass}>
                State <span className="text-red-500">*</span>
              </label>
              <input
                id="retailer-state"
                type="text"
                required
                value={values.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="retailer-pincode" className={labelClass}>
                Pincode
              </label>
              <input
                id="retailer-pincode"
                type="text"
                inputMode="numeric"
                value={values.pincode}
                onChange={(e) => update("pincode", e.target.value)}
                placeholder="6 digits"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="retailer-status" className={labelClass}>
                Status
              </label>
              <select
                id="retailer-status"
                value={values.isActive ? "active" : "inactive"}
                onChange={(e) => update("isActive", e.target.value === "active")}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="retailer-notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="retailer-notes"
              rows={3}
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Optional internal notes about this retailer…"
              className={`${inputClass} resize-none`}
            />
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
              {isEdit ? "Save Changes" : "Save Retailer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
