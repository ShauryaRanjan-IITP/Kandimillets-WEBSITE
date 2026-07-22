"use client";

/**
 * Connects RetailerFormModal to the createRetailer/updateRetailer Server
 * Actions and to the URL-driven "is this modal open" convention already
 * established by SalesRegisterView.tsx (`?create=1` / `?edit=<id>`) —
 * closing means stripping that param, not local state.
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createRetailer, updateRetailer } from "@/app/admin/(app)/retailers/actions";
import RetailerFormModal from "./RetailerFormModal";
import type { RetailerFormValues, RetailerRow } from "./types";
import { retailerToFormValues } from "./types";

interface RetailerFormModalControllerProps {
  editingRetailer: RetailerRow | null;
}

export default function RetailerFormModalController({ editingRetailer }: RetailerFormModalControllerProps) {
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

  async function handleSubmit(values: RetailerFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    const result = editingRetailer
      ? await updateRetailer(editingRetailer.id, values)
      : await createRetailer(values);

    setSubmitting(false);

    if (result.status === "success") {
      close(editingRetailer ? "edit" : "create");
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <RetailerFormModal
      onClose={() => close(editingRetailer ? "edit" : "create")}
      onSubmit={handleSubmit}
      initialValues={editingRetailer ? retailerToFormValues(editingRetailer) : undefined}
      submitting={submitting}
      submitError={submitError}
    />
  );
}
