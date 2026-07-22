"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resetUserPassword } from "@/app/admin/(app)/users/actions";
import ResetPasswordDialog from "./ResetPasswordDialog";
import type { UserRow } from "./types";

interface ResetPasswordDialogControllerProps {
  user: UserRow;
}

export default function ResetPasswordDialogController({ user }: ResetPasswordDialogControllerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function close() {
    const params = new URLSearchParams(searchParams);
    params.delete("resetPassword");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  async function handleConfirm(newPassword: string) {
    setSubmitting(true);
    setSubmitError(null);
    const result = await resetUserPassword(user.id, newPassword);
    setSubmitting(false);

    if (result.status === "success") {
      close();
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <ResetPasswordDialog userName={user.name} onClose={close} onConfirm={handleConfirm} submitting={submitting} submitError={submitError} />
  );
}
