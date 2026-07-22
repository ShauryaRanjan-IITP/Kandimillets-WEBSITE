"use client";

/**
 * Business Settings form — a single inline card (not a modal, since
 * there's exactly one settings row to edit), matching the exact field
 * chrome conventions already established by RetailerFormModal.tsx /
 * ProductFormModal.tsx rather than inventing new form styling.
 */
import { useState } from "react";
import { updateBusinessSettings } from "@/app/admin/(app)/settings/actions";
import type { BusinessSettingsDTO } from "@/lib/settings/dto";

interface BusinessSettingsFormProps {
  initialSettings: BusinessSettingsDTO;
}

interface FormValues {
  businessName: string;
  gstNumber: string;
  address: string;
  phone: string;
  email: string;
  invoicePrefix: string;
  defaultCurrency: string;
  defaultUnit: string;
  defaultLowStockThreshold: string;
}

function toFormValues(settings: BusinessSettingsDTO): FormValues {
  return {
    businessName: settings.businessName,
    gstNumber: settings.gstNumber ?? "",
    address: settings.address ?? "",
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    invoicePrefix: settings.invoicePrefix,
    defaultCurrency: settings.defaultCurrency,
    defaultUnit: settings.defaultUnit,
    defaultLowStockThreshold: settings.defaultLowStockThreshold !== null ? String(settings.defaultLowStockThreshold) : "",
  };
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

const ALLOWED_UNITS = ["kg", "g", "pack", "box", "litre", "pcs"];

export default function BusinessSettingsForm({ initialSettings }: BusinessSettingsFormProps) {
  const [values, setValues] = useState<FormValues>(toFormValues(initialSettings));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const result = await updateBusinessSettings(values);
    setSubmitting(false);

    if (result.status === "success") {
      setValues(toFormValues(result.settings));
      setSuccess(true);
      return;
    }
    setError(result.message);
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card space-y-5 p-6 md:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="settings-business-name" className={labelClass}>
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            id="settings-business-name"
            type="text"
            required
            value={values.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="settings-gst" className={labelClass}>
            GST Number
          </label>
          <input
            id="settings-gst"
            type="text"
            value={values.gstNumber}
            onChange={(e) => update("gstNumber", e.target.value)}
            placeholder="15-character GSTIN"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="settings-address" className={labelClass}>
            Business Address
          </label>
          <input
            id="settings-address"
            type="text"
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="settings-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="settings-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="settings-email" className={labelClass}>
            Email
          </label>
          <input
            id="settings-email"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="settings-invoice-prefix" className={labelClass}>
            Invoice Prefix <span className="text-red-500">*</span>
          </label>
          <input
            id="settings-invoice-prefix"
            type="text"
            required
            value={values.invoicePrefix}
            onChange={(e) => update("invoicePrefix", e.target.value)}
            placeholder="e.g. INV"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="settings-currency" className={labelClass}>
            Default Currency <span className="text-red-500">*</span>
          </label>
          <input
            id="settings-currency"
            type="text"
            required
            value={values.defaultCurrency}
            onChange={(e) => update("defaultCurrency", e.target.value)}
            placeholder="e.g. INR"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="settings-unit" className={labelClass}>
            Default Unit <span className="text-red-500">*</span>
          </label>
          <select
            id="settings-unit"
            required
            value={values.defaultUnit}
            onChange={(e) => update("defaultUnit", e.target.value)}
            className={inputClass}
          >
            {ALLOWED_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="settings-threshold" className={labelClass}>
            Default Low Stock Threshold
          </label>
          <input
            id="settings-threshold"
            type="number"
            min={0}
            step="0.001"
            value={values.defaultLowStockThreshold}
            onChange={(e) => update("defaultLowStockThreshold", e.target.value)}
            placeholder="e.g. 10"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-brown-400">Used as a suggested starting point for new products.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Business Settings saved.
        </div>
      )}

      <div className="flex items-center justify-end border-t border-warm-200 pt-5">
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
          Save Settings
        </button>
      </div>
    </form>
  );
}
