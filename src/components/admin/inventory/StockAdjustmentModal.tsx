"use client";

/**
 * Stock Adjustment — the one reusable modal for both Increase and Decrease
 * (this task's explicit "Create a reusable adjustment modal" requirement),
 * matching RetailerFormModal.tsx/ProductFormModal.tsx's exact chrome/field
 * conventions rather than inventing new modal styling.
 */
import { useMemo, useState } from "react";
import type { ProductStockOption, StockAdjustmentFormValues, StockReason } from "./types";
import { MANUAL_ADJUSTMENT_REASONS, REASON_LABELS, emptyStockAdjustmentFormValues } from "./types";

interface StockAdjustmentModalProps {
  onClose: () => void;
  onSubmit: (values: StockAdjustmentFormValues) => void | Promise<void>;
  products: ProductStockOption[];
  /** Preselects and locks the product when opened from a specific row
   * (e.g. the Inventory table's per-row Adjust action or the Product
   * Detail page) — left editable when opened from the toolbar's global
   * "Adjust Stock" button. */
  initialProductId?: string;
  lockProduct?: boolean;
  submitting?: boolean;
  submitError?: string | null;
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const readOnlyClass = "w-full rounded-xl border border-warm-200 bg-warm-100 px-3.5 py-2.5 text-sm text-brown-500";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";

export default function StockAdjustmentModal({
  onClose,
  onSubmit,
  products,
  initialProductId = "",
  lockProduct = false,
  submitting = false,
  submitError = null,
}: StockAdjustmentModalProps) {
  const [values, setValues] = useState<StockAdjustmentFormValues>(() =>
    emptyStockAdjustmentFormValues(initialProductId)
  );
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === values.productId) ?? null,
    [products, values.productId]
  );

  function update<K extends keyof StockAdjustmentFormValues>(key: K, value: StockAdjustmentFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const quantityNumber = Number(values.quantity);
  const projectedBalance = selectedProduct
    ? values.direction === "IN"
      ? selectedProduct.currentStock + (Number.isFinite(quantityNumber) ? quantityNumber : 0)
      : selectedProduct.currentStock - (Number.isFinite(quantityNumber) ? quantityNumber : 0)
    : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.productId) {
      setError("Please select a product.");
      return;
    }
    if (!values.quantity || !Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    if (values.direction === "OUT" && projectedBalance !== null && projectedBalance < 0) {
      setError(`This would take stock negative — only ${selectedProduct?.currentStock} ${selectedProduct?.unit} available.`);
      return;
    }

    await onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card w-full max-w-lg p-6 md:p-8">
        <div className="flex items-start justify-between border-b border-warm-200 pb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-brown-900">Adjust Stock</h2>
            <p className="mt-1 text-sm text-brown-500">Quantity, Reason, and Notes are recorded permanently.</p>
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
          <div>
            <label htmlFor="adjustment-product" className={labelClass}>
              Product <span className="text-red-500">*</span>
            </label>
            {lockProduct && selectedProduct ? (
              <input
                value={`${selectedProduct.name}${selectedProduct.sku ? ` (${selectedProduct.sku})` : ""}`}
                readOnly
                className={readOnlyClass}
              />
            ) : (
              <select
                id="adjustment-product"
                required
                value={values.productId}
                onChange={(e) => update("productId", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.sku ? ` (${product.sku})` : ""}
                    {!product.isActive ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
            )}
            {selectedProduct && (
              <p className="mt-1 text-xs text-brown-400">
                Current stock: {selectedProduct.currentStock} {selectedProduct.unit}
              </p>
            )}
          </div>

          <fieldset>
            <legend className={labelClass}>
              Direction <span className="text-red-500">*</span>
            </legend>
            <div className="flex gap-3">
              <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-warm-300 px-4 py-2.5 text-sm font-medium text-brown-700 transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:text-green-700">
                <input
                  type="radio"
                  name="adjustment-direction"
                  value="IN"
                  checked={values.direction === "IN"}
                  onChange={() => update("direction", "IN")}
                  className="h-4 w-4 text-green-600 focus:ring-green-500/30"
                />
                Increase Stock
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-warm-300 px-4 py-2.5 text-sm font-medium text-brown-700 transition-colors has-[:checked]:border-red-400 has-[:checked]:bg-red-50 has-[:checked]:text-red-700">
                <input
                  type="radio"
                  name="adjustment-direction"
                  value="OUT"
                  checked={values.direction === "OUT"}
                  onChange={() => update("direction", "OUT")}
                  className="h-4 w-4 text-red-600 focus:ring-red-500/30"
                />
                Decrease Stock
              </label>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="adjustment-quantity" className={labelClass}>
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="adjustment-quantity"
                type="number"
                required
                min={0}
                step="0.001"
                value={values.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                placeholder="e.g. 25"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="adjustment-reason" className={labelClass}>
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="adjustment-reason"
                required
                value={values.reason}
                onChange={(e) => update("reason", e.target.value as StockReason)}
                className={inputClass}
              >
                {MANUAL_ADJUSTMENT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {REASON_LABELS[reason]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProduct && values.quantity && (
            <p className="text-xs text-brown-500">
              New balance after this adjustment:{" "}
              <span className="font-semibold text-brown-800">
                {projectedBalance} {selectedProduct.unit}
              </span>
            </p>
          )}

          <div>
            <label htmlFor="adjustment-notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="adjustment-notes"
              rows={3}
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Optional context for this adjustment…"
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
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
