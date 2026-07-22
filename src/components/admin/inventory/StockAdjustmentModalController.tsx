"use client";

/**
 * Connects StockAdjustmentModal to the adjustStock Server Action and to
 * the URL-driven "is this modal open" convention already established by
 * RetailerFormModalController.tsx / ProductFormModalController.tsx
 * (`?adjust=1` for the toolbar's global button, `?adjust=<productId>` for
 * a specific row/detail page) — closing means stripping that param, not
 * local state.
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { adjustStock } from "@/app/admin/(app)/inventory/actions";
import StockAdjustmentModal from "./StockAdjustmentModal";
import type { ProductStockOption, StockAdjustmentFormValues } from "./types";

interface StockAdjustmentModalControllerProps {
  products: ProductStockOption[];
  /** The raw `adjust` query param value — either "1" (blank, product
   * chosen in the modal) or a specific product id (locked). */
  adjustParam: string;
}

export default function StockAdjustmentModalController({ products, adjustParam }: StockAdjustmentModalControllerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lockProduct = adjustParam !== "1";
  const initialProductId = lockProduct ? adjustParam : "";

  function close() {
    const params = new URLSearchParams(searchParams);
    params.delete("adjust");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  async function handleSubmit(values: StockAdjustmentFormValues) {
    setSubmitting(true);
    setSubmitError(null);
    const result = await adjustStock(values);
    setSubmitting(false);

    if (result.status === "success") {
      close();
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <StockAdjustmentModal
      onClose={close}
      onSubmit={handleSubmit}
      products={products}
      initialProductId={initialProductId}
      lockProduct={lockProduct}
      submitting={submitting}
      submitError={submitError}
    />
  );
}
