"use client";

/**
 * Connects UserFormModal to the createUser/updateUser Server Actions and
 * to the URL-driven "is this modal open" convention (`?create=1` /
 * `?edit=<id>`) already established by RetailerFormModalController.tsx.
 */
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createUser, updateUser } from "@/app/admin/(app)/users/actions";
import UserFormModal from "./UserFormModal";
import type { CreateUserFormValues, UserRow } from "./types";
import { userToFormValues } from "./types";

interface UserFormModalControllerProps {
  editingUser: UserRow | null;
}

export default function UserFormModalController({ editingUser }: UserFormModalControllerProps) {
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

  async function handleSubmit(values: CreateUserFormValues) {
    setSubmitting(true);
    setSubmitError(null);

    const result = editingUser ? await updateUser(editingUser.id, values) : await createUser(values);

    setSubmitting(false);

    if (result.status === "success") {
      close(editingUser ? "edit" : "create");
      return;
    }
    setSubmitError(result.message);
  }

  return (
    <UserFormModal
      onClose={() => close(editingUser ? "edit" : "create")}
      onSubmit={handleSubmit}
      initialValues={editingUser ? userToFormValues(editingUser) : undefined}
      submitting={submitting}
      submitError={submitError}
    />
  );
}
