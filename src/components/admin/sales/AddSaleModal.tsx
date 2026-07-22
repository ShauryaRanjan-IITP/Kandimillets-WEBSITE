"use client";

import { useMemo, useState } from "react";
import type {
  AddSaleFormValues,
  PaymentMethod,
  PaymentStatus,
  ProductOption,
  RetailerOption,
} from "./types";
import { PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS_OPTIONS } from "./types";

interface AddSaleModalProps {
  onClose: () => void;
  retailers: RetailerOption[];
  products: ProductOption[];
  /** Add mode: a preview of the next sale number. Edit mode: the sale's
   * real, already-assigned, immutable sale number. Either way, this value
   * is display-only — never submitted, never editable. */
  saleNumberDisplay: string;
  /** Present only when editing an existing sale. */
  initialValues?: AddSaleFormValues;
  onSubmit: (values: AddSaleFormValues) => void | Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function emptyForm(): AddSaleFormValues {
  return {
    invoiceNumber: "",
    invoiceDate: today(),
    dueDate: "",
    retailerId: "",
    productId: "",
    quantity: "",
    unit: "",
    rate: "",
    gstIncluded: false,
    paymentMethod: "",
    paymentStatus: "PENDING",
    amountPaid: "",
    paymentDate: "",
    remarks: "",
  };
}

const inputClass =
  "w-full rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";
const labelClass = "mb-1.5 block text-sm font-medium text-brown-700";
const readOnlyClass =
  "w-full rounded-xl border border-warm-200 bg-warm-100 px-3.5 py-2.5 text-sm text-brown-500";

export default function AddSaleModal({
  onClose,
  retailers,
  products,
  saleNumberDisplay,
  initialValues,
  onSubmit,
  submitting = false,
  submitError = null,
}: AddSaleModalProps) {
  const isEdit = Boolean(initialValues);
  const [values, setValues] = useState<AddSaleFormValues>(initialValues ?? emptyForm);
  const [error, setError] = useState<string | null>(null);

  const selectedRetailer = useMemo(
    () => retailers.find((r) => r.id === values.retailerId) ?? null,
    [retailers, values.retailerId]
  );
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === values.productId) ?? null,
    [products, values.productId]
  );

  const quantityNumber = Number(values.quantity);
  const rateNumber = Number(values.rate);
  const totalAmount =
    Number.isFinite(quantityNumber) && Number.isFinite(rateNumber) && values.quantity && values.rate
      ? Math.round(quantityNumber * rateNumber * 100) / 100
      : 0;

  const showPaymentCapture = values.paymentStatus === "PARTIAL" || values.paymentStatus === "PAID";
  const amountPaidNumber = values.paymentStatus === "PAID" ? totalAmount : Number(values.amountPaid);
  const outstandingAmount =
    showPaymentCapture && Number.isFinite(amountPaidNumber)
      ? Math.round((totalAmount - amountPaidNumber) * 100) / 100
      : totalAmount;

  function handleProductChange(productId: string) {
    const product = products.find((p) => p.id === productId);
    setValues((prev) => ({
      ...prev,
      productId,
      unit: product ? product.defaultUnit : prev.unit,
    }));
  }

  function handleStatusChange(status: PaymentStatus) {
    setValues((prev) => ({
      ...prev,
      paymentStatus: status,
      amountPaid: status === "PENDING" || status === "CANCELLED" ? "" : prev.amountPaid,
      paymentDate: status === "PENDING" || status === "CANCELLED" ? "" : prev.paymentDate,
      paymentMethod: status === "PENDING" || status === "CANCELLED" ? "" : prev.paymentMethod,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.retailerId || !values.productId) {
      setError("Please select a retailer and a product.");
      return;
    }
    if (!values.quantity || quantityNumber <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    if (!values.rate || rateNumber <= 0) {
      setError("Rate must be greater than zero.");
      return;
    }
    const dueDate = values.dueDate || values.invoiceDate;
    if (dueDate < values.invoiceDate) {
      setError("Due Date cannot be earlier than Invoice Date.");
      return;
    }
    if (showPaymentCapture && !values.paymentDate) {
      setError("Payment Date is required when recording a Partial or Paid sale.");
      return;
    }
    if (showPaymentCapture && !values.paymentMethod) {
      setError("Payment Method is required when recording a Partial or Paid sale.");
      return;
    }
    if (values.paymentStatus === "PARTIAL" && (amountPaidNumber <= 0 || amountPaidNumber >= totalAmount)) {
      setError("Amount Paid must be strictly between 0 and the Total Amount for a Partial sale.");
      return;
    }

    await onSubmit({
      ...values,
      dueDate,
      amountPaid: showPaymentCapture ? String(amountPaidNumber) : "0",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card w-full max-w-2xl p-6 md:p-8">
        <div className="flex items-start justify-between border-b border-warm-200 pb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-brown-900">
              {isEdit ? "Edit Sale" : "Add Sale"}
            </h2>
            <p className="mt-1 text-sm text-brown-500">
              {isEdit
                ? "Sale Number is permanent and cannot be changed."
                : "Sale Number will be assigned automatically on save."}
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
          {/* Read-only computed fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Sale Number</label>
              <input value={saleNumberDisplay} readOnly className={readOnlyClass} />
            </div>
            <div>
              <label className={labelClass}>Total Amount</label>
              <input value={`₹${totalAmount.toFixed(2)}`} readOnly className={readOnlyClass} />
            </div>
            <div>
              <label className={labelClass}>Outstanding Amount</label>
              <input value={`₹${outstandingAmount.toFixed(2)}`} readOnly className={readOnlyClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="add-sale-invoice-number" className={labelClass}>
                Invoice Number
              </label>
              <input
                id="add-sale-invoice-number"
                type="text"
                value={values.invoiceNumber}
                onChange={(e) => setValues((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="e.g. INV-202601-0001"
                className={inputClass}
              />
            </div>
            <div />

            <div>
              <label htmlFor="add-sale-invoice-date" className={labelClass}>
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                id="add-sale-invoice-date"
                type="date"
                required
                value={values.invoiceDate}
                onChange={(e) => setValues((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="add-sale-due-date" className={labelClass}>
                Due Date
              </label>
              <input
                id="add-sale-due-date"
                type="date"
                value={values.dueDate}
                placeholder={values.invoiceDate}
                onChange={(e) => setValues((prev) => ({ ...prev, dueDate: e.target.value }))}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-brown-400">Defaults to Invoice Date if left blank.</p>
            </div>

            <div>
              <label htmlFor="add-sale-retailer" className={labelClass}>
                Retailer <span className="text-red-500">*</span>
              </label>
              <select
                id="add-sale-retailer"
                required
                value={values.retailerId}
                onChange={(e) => setValues((prev) => ({ ...prev, retailerId: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select a retailer</option>
                {retailers.map((retailer) => (
                  <option key={retailer.id} value={retailer.id}>
                    {retailer.name}
                    {!retailer.isActive ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                value={selectedRetailer ? `${selectedRetailer.city}, ${selectedRetailer.state}` : ""}
                readOnly
                placeholder="Set automatically from Retailer"
                className={readOnlyClass}
              />
            </div>

            <div>
              <label htmlFor="add-sale-product" className={labelClass}>
                Product <span className="text-red-500">*</span>
              </label>
              <select
                id="add-sale-product"
                required
                value={values.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {!product.isActive ? " (Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-sale-unit" className={labelClass}>
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                id="add-sale-unit"
                type="text"
                required
                value={values.unit}
                onChange={(e) => setValues((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder={selectedProduct?.defaultUnit ?? "kg, pack, box…"}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="add-sale-quantity" className={labelClass}>
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="add-sale-quantity"
                type="number"
                required
                min={0}
                step="0.01"
                value={values.quantity}
                onChange={(e) => setValues((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g. 10.5"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="add-sale-rate" className={labelClass}>
                Rate (₹ per unit) <span className="text-red-500">*</span>
              </label>
              <input
                id="add-sale-rate"
                type="number"
                required
                min={0}
                step="0.01"
                value={values.rate}
                onChange={(e) => setValues((prev) => ({ ...prev, rate: e.target.value }))}
                placeholder="e.g. 420"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label htmlFor="add-sale-gst" className="flex items-center gap-2.5 text-sm font-medium text-brown-700">
                <input
                  id="add-sale-gst"
                  type="checkbox"
                  checked={values.gstIncluded}
                  onChange={(e) => setValues((prev) => ({ ...prev, gstIncluded: e.target.checked }))}
                  className="h-4 w-4 rounded border-warm-300 text-green-600 focus:ring-green-500/30"
                />
                GST Included
              </label>
            </div>
            <div />

            <div>
              <label htmlFor="add-sale-payment-status" className={labelClass}>
                Payment Status <span className="text-red-500">*</span>
              </label>
              <select
                id="add-sale-payment-status"
                required
                value={values.paymentStatus}
                onChange={(e) => handleStatusChange(e.target.value as PaymentStatus)}
                className={inputClass}
              >
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div />

            {showPaymentCapture && (
              <>
                <div>
                  <label htmlFor="add-sale-amount-paid" className={labelClass}>
                    Amount Paid <span className="text-red-500">*</span>
                  </label>
                  {values.paymentStatus === "PAID" ? (
                    <input value={`₹${totalAmount.toFixed(2)}`} readOnly className={readOnlyClass} />
                  ) : (
                    <input
                      id="add-sale-amount-paid"
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={values.amountPaid}
                      onChange={(e) => setValues((prev) => ({ ...prev, amountPaid: e.target.value }))}
                      placeholder="Less than Total Amount"
                      className={inputClass}
                    />
                  )}
                </div>
                <div>
                  <label htmlFor="add-sale-payment-date" className={labelClass}>
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="add-sale-payment-date"
                    type="date"
                    required
                    value={values.paymentDate}
                    onChange={(e) => setValues((prev) => ({ ...prev, paymentDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="add-sale-payment-method" className={labelClass}>
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="add-sale-payment-method"
                    required
                    value={values.paymentMethod}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, paymentMethod: e.target.value as PaymentMethod | "" }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select a method</option>
                    {PAYMENT_METHOD_OPTIONS.map((method) => (
                      <option key={method} value={method}>
                        {method.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div />
              </>
            )}
          </div>

          <div>
            <label htmlFor="add-sale-remarks" className={labelClass}>
              Remarks
            </label>
            <textarea
              id="add-sale-remarks"
              rows={3}
              value={values.remarks}
              onChange={(e) => setValues((prev) => ({ ...prev, remarks: e.target.value }))}
              placeholder="Optional notes about this sale…"
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
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isEdit ? "Save Changes" : "Save Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
