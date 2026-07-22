"use server";

/**
 * Profile Server Actions — every authenticated user's own self-service
 * account management (this task's §4), separate from the SUPER_ADMIN-only
 * User Management module. Follows the same sanitize -> validate ->
 * business logic -> Prisma chain as every other module.
 */
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { getSessionSafe } from "@/lib/auth/session";
import { APIError } from "better-auth/api";
import prisma from "@/lib/db/prisma";
import { serializeUser, type UserDTO } from "@/lib/users/dto";
import { findUserByEmail } from "@/lib/users/queries";
import {
  validateChangePasswordInput,
  validateProfileInput,
  type ChangePasswordInput,
  type ProfileInput,
  type ValidationError,
} from "@/lib/profile/validation";
import { writeAuditLog } from "@/lib/audit/log";

export type ProfileActionState =
  | { status: "success"; user: UserDTO }
  | { status: "validation_error"; message: string; errors: ValidationError[] }
  | { status: "auth_error"; message: string }
  | { status: "business_rule_error"; message: string }
  | { status: "error"; message: string };

export async function updateProfile(input: ProfileInput): Promise<ProfileActionState> {
  const session = await getSessionSafe();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to update your profile." };
  }

  const result = validateProfileInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const duplicate = await findUserByEmail(data.email, session.user.id);
  if (duplicate) {
    return { status: "business_rule_error", message: `A user with the email "${data.email}" already exists.` };
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id: session.user.id }, data });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: updated.name,
          action: "UPDATE",
          entityType: "USER",
          entityId: updated.id,
          reference: updated.email,
          summary: `${updated.name} updated their own profile.`,
        },
        tx
      );
      return updated;
    });

    revalidatePath("/admin/profile");
    return { status: "success", user: serializeUser(user) };
  } catch (error) {
    console.error("updateProfile failed:", error);
    return { status: "error", message: "Could not save your profile. Please try again." };
  }
}

export async function changeOwnPassword(input: ChangePasswordInput): Promise<ProfileActionState> {
  const session = await getSessionSafe();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to change your password." };
  }

  const result = validateChangePasswordInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  try {
    // Better Auth's own endpoint — verifies currentPassword against the
    // stored scrypt hash and writes the new one, the same maintained
    // hashing implementation already used everywhere else in this
    // project (docs/ADMIN_SYSTEM.md §4's "not overridden with bcrypt").
    // `revokeOtherSessions: true` forces re-authentication everywhere,
    // including this session (verified: the caller's own session no
    // longer validates immediately after) — the same "password reset
    // forces re-auth everywhere" guarantee resetUserPassword gives when a
    // Super Admin resets someone else's.
    await auth.api.changePassword({
      body: { currentPassword: data.currentPassword, newPassword: data.newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
    await writeAuditLog({
      userId: session.user.id,
      userName: user.name,
      action: "PASSWORD_RESET",
      entityType: "USER",
      entityId: user.id,
      reference: user.email,
      summary: `${user.name} changed their own password.`,
    });

    return { status: "success", user: serializeUser(user) };
  } catch (error) {
    if (error instanceof APIError) {
      return { status: "business_rule_error", message: "Current password is incorrect." };
    }
    console.error("changeOwnPassword failed:", error);
    return { status: "error", message: "Could not change your password. Please try again." };
  }
}
