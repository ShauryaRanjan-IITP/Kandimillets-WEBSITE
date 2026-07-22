"use client";

/**
 * Create/Edit Product — one reusable modal for both flows (this task's
 * explicit "Edit Product: reuse the same modal" requirement), matching
 * RetailerFormModal.tsx's exact chrome/field conventions rather than
 * inventing new modal styling.
 */
import { useState } from "react";
import type { ProductFormValues } from "./types";
import { ALLOWED_UNITS, emptyProductFormValues } from "./types";

interface ProductFormModalProps {
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  initialValues?: ProductFormValues;
  submitting?: boolean;
  submitError?: string | null;
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

export default function ProductFormModal({
  onClose,
  onSubmit,
  initialValues,
  submitting = false,
  submitError = null,
}: ProductFormModalProps) {
  const isEdit = Boolean(initialValues);
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? emptyProductFormValues);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Product Name is required.");
      return;
    }
    if (!values.sku.trim()) {
      setError("SKU is required.");
      return;
    }
    if (!values.unit) {
      setError("Unit is required.");
      return;
    }
    const price = Number(values.sellingPrice);
    if (!values.sellingPrice || !Number.isFinite(price) || price <= 0) {
      setError("Selling Price must be greater than zero.");
      return;
    }

    await onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card w-full max-w-2xl p-6 md:p-8">
        <div className="flex items-start justify-between border-b border-warm-200 pb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-brown-900">{isEdit ? "Edit Product" : "Add Product"}</h2>
            <p className="mt-1 text-sm text-brown-500">
              {isEdit ? "Update this product's details." : "Product Name, SKU, Unit, and Selling Price are required."}
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
              <label htmlFor="product-name" className={labelClass}>
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="product-sku" className={labelClass}>
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                id="product-sku"
                type="text"
                required
                value={values.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="e.g. MKN-PLN-1KG"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="product-category" className={labelClass}>
                Category
              </label>
              <input
                id="product-category"
                type="text"
                value={values.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="e.g. makhana, sattu, millet"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="product-unit" className={labelClass}>
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                id="product-unit"
                required
                value={values.unit}
                onChange={(e) => update("unit", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a unit</option>
                {ALLOWED_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="product-selling-price" className={labelClass}>
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="product-selling-price"
                type="number"
                required
                min={0}
                step="0.01"
                value={values.sellingPrice}
                onChange={(e) => update("sellingPrice", e.target.value)}
                placeholder="e.g. 420"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="product-status" className={labelClass}>
                Status
              </label>
              <select
                id="product-status"
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
            <label htmlFor="product-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Optional description of this product…"
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
              {isEdit ? "Save Changes" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
