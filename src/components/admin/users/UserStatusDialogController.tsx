"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { setUserStatus } from "@/app/admin/(app)/users/actions";
import UserStatusDialog from "./UserStatusDialog";
import type { UserRow } from "./types";

interface UserStatusDialogControllerProps {
  user: UserRow;
}

export default function UserStatusDialogController({ user }: UserStatusDialogControllerProps) {
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
    const result = await setUserStatus(user.id, !user.isActive);
    setSubmitting(false);

    if (result.status === "success") {
      close();
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <UserStatusDialog
      userName={user.name}
      isActive={user.isActive}
      onClose={close}
      onConfirm={handleConfirm}
      submitting={submitting}
      submitError={submitError}
    />
  );
}
