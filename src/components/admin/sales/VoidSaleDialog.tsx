"use client";

import { useState } from "react";
import type { SaleRow } from "./types";

interface VoidSaleDialogProps {
  sale: SaleRow;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
}

export default function VoidSaleDialog({ sale, onClose, onConfirm, submitting = false, submitError = null }: VoidSaleDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!reason.trim()) {
      setError("A reason is required to void this sale.");
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card w-full max-w-md p-6">
        <h2 className="font-heading text-lg font-bold text-brown-900">Void Sale {sale.saleNumber}?</h2>
        <p className="mt-1 text-sm text-brown-500">
          This row will be hidden from the default view but never deleted — it remains part of the
          permanent financial record.
        </p>

        <div className="mt-4">
          <label htmlFor="void-reason" className="mb-1.5 block text-sm font-medium text-brown-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="void-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this sale being voided?"
            className="w-full resize-none rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm text-brown-900 placeholder:text-brown-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>

        {(error || submitError) && (
          <div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error ?? submitError}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-warm-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brown-300 px-5 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Void Sale
          </button>
        </div>
      </div>
    </div>
  );
}
