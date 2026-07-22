"use client";

/**
 * Connects ProductStatusDialog to the setProductStatus Server Action,
 * URL-driven exactly like ProductFormModalController (`?status=<id>`).
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setProductStatus } from "@/app/admin/(app)/products/actions";
import ProductStatusDialog from "./ProductStatusDialog";
import type { ProductRow } from "./types";

interface ProductStatusDialogControllerProps {
  product: ProductRow;
}

export default function ProductStatusDialogController({ product }: ProductStatusDialogControllerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function close() {
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError(null);
    const result = await setProductStatus(product.id, !product.isActive);
    setSubmitting(false);

    if (result.status === "success") {
      close();
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <ProductStatusDialog
      productName={product.name}
      isActive={product.isActive}
      onClose={close}
      onConfirm={handleConfirm}
      submitting={submitting}
      submitError={submitError}
    />
  );
}
