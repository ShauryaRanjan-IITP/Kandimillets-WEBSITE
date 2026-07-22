"use client";

/**
 * Connects RetailerStatusDialog to the setRetailerStatus Server Action,
 * URL-driven exactly like RetailerFormModalController (`?status=<id>`).
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setRetailerStatus } from "@/app/admin/(app)/retailers/actions";
import RetailerStatusDialog from "./RetailerStatusDialog";
import type { RetailerRow } from "./types";

interface RetailerStatusDialogControllerProps {
  retailer: RetailerRow;
}

export default function RetailerStatusDialogController({ retailer }: RetailerStatusDialogControllerProps) {
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
    const result = await setRetailerStatus(retailer.id, !retailer.isActive);
    setSubmitting(false);

    if (result.status === "success") {
      close();
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <RetailerStatusDialog
      retailerName={retailer.name}
      isActive={retailer.isActive}
      onClose={close}
      onConfirm={handleConfirm}
      submitting={submitting}
      submitError={submitError}
    />
  );
}
