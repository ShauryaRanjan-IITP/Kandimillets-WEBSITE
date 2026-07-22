"use client";

/**
 * Connects ProductFormModal to the createProduct/updateProduct Server
 * Actions and to the URL-driven "is this modal open" convention already
 * established by RetailerFormModalController.tsx (`?create=1` / `?edit=<id>`)
 * — closing means stripping that param, not local state.
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createProduct, updateProduct } from "@/app/admin/(app)/products/actions";
import ProductFormModal from "./ProductFormModal";
import type { ProductFormValues, ProductRow } from "./types";
import { productToFormValues } from "./types";

interface ProductFormModalControllerProps {
  editingProduct: ProductRow | null;
}

export default function ProductFormModalController({ editingProduct }: ProductFormModalControllerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function close(paramToRemove: "create" | "edit") {
    const params = new URLSearchParams(searchParams);
    params.delete(paramToRemove);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    const result = editingProduct ? await updateProduct(editingProduct.id, values) : await createProduct(values);

    setSubmitting(false);

    if (result.status === "success") {
      close(editingProduct ? "edit" : "create");
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <ProductFormModal
      onClose={() => close(editingProduct ? "edit" : "create")}
      onSubmit={handleSubmit}
      initialValues={editingProduct ? productToFormValues(editingProduct) : undefined}
      submitting={submitting}
      submitError={submitError}
    />
  );
}
