"use server";

/**
 * User Management Server Actions — follows the exact
 * sanitize -> validate -> business logic -> Prisma chain and response
 * shape already established by every other module's actions.ts.
 *
 * Restricted to SUPER_ADMIN — the first real use of the `role` field
 * this project has ever enforced (docs/ADMIN_SYSTEM.md §5 reserved it
 * ahead of need; this is that need). Provisioning/deactivating/
 * resetting another admin's credentials is exactly the kind of action
 * docs/SALES_REGISTER.md §13 anticipated being restricted "once role
 * enforcement exists" — this module is that enforcement's first home,
 * not a general permissions matrix (explicitly out of scope per this
 * task's DO NOT IMPLEMENT list).
 */
import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { getSessionSafe } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { serializeUser, type UserDTO } from "@/lib/users/dto";
import { countActiveSuperAdmins, findUserByEmail } from "@/lib/users/queries";
import {
  validateCreateUserInput,
  validateNewPassword,
  validateUserInput,
  type CreateUserInput,
  type UserInput,
  type ValidationError,
} from "@/lib/users/validation";
import { writeAuditLog } from "@/lib/audit/log";

export type UserActionState =
  | { status: "success"; user: UserDTO }
  | { status: "validation_error"; message: string; errors: ValidationError[] }
  | { status: "auth_error"; message: string }
  | { status: "business_rule_error"; message: string }
  | { status: "error"; message: string };

async function requireSuperAdmin() {
  const session = await getSessionSafe();
  if (!session) {
    return { error: { status: "auth_error", message: "You must be signed in." } as const };
  }
  if (session.user.role !== "SUPER_ADMIN") {
    return { error: { status: "auth_error", message: "Only a Super Admin can manage users." } as const };
  }
  return { session };
}

export async function createUser(input: CreateUserInput): Promise<UserActionState> {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;
  const { session } = guard;

  const result = validateCreateUserInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const duplicate = await findUserByEmail(data.email);
  if (duplicate) {
    return { status: "business_rule_error", message: `A user with the email "${data.email}" already exists.` };
  }

  try {
    const passwordHash = await hashPassword(data.password);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name: data.name, email: data.email, role: data.role, isActive: data.isActive, emailVerified: true },
      });
      await tx.account.create({
        data: { userId: created.id, accountId: created.email, providerId: "credential", password: passwordHash },
      });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "CREATE",
          entityType: "USER",
          entityId: created.id,
          reference: created.email,
          summary: `${session.user.name} created user "${created.name}" (${created.role}).`,
        },
        tx
      );
      return created;
    });

    revalidatePath("/admin/users");
    return { status: "success", user: serializeUser(user) };
  } catch (error) {
    console.error("createUser failed:", error);
    return { status: "error", message: "Could not create the user. Please try again." };
  }
}

export async function updateUser(id: string, input: UserInput): Promise<UserActionState> {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;
  const { session } = guard;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This user could not be found." };
  }

  const result = validateUserInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const duplicate = await findUserByEmail(data.email, id);
  if (duplicate) {
    return { status: "business_rule_error", message: `A user with the email "${data.email}" already exists.` };
  }

  const losingFinalSuperAdmin =
    existing.role === "SUPER_ADMIN" &&
    existing.isActive &&
    (data.role !== "SUPER_ADMIN" || !data.isActive) &&
    (await countActiveSuperAdmins()) === 1;
  if (losingFinalSuperAdmin) {
    return { status: "business_rule_error", message: "Cannot change or deactivate the last remaining Super Admin." };
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id }, data });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "UPDATE",
          entityType: "USER",
          entityId: updated.id,
          reference: updated.email,
          summary: `${session.user.name} updated user "${updated.name}".`,
        },
        tx
      );
      return updated;
    });

    revalidatePath("/admin/users");
    return { status: "success", user: serializeUser(user) };
  } catch (error) {
    console.error("updateUser failed:", error);
    return { status: "error", message: "Could not save the changes. Please try again." };
  }
}

/** Activate/deactivate — never a hard delete, per this task's explicit
 * "Never hard delete users" requirement. */
export async function setUserStatus(id: string, isActive: boolean): Promise<UserActionState> {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;
  const { session } = guard;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This user could not be found." };
  }
  if (existing.isActive === isActive) {
    return { status: "business_rule_error", message: `This user is already ${isActive ? "active" : "inactive"}.` };
  }

  if (!isActive && existing.role === "SUPER_ADMIN" && (await countActiveSuperAdmins()) === 1) {
    return { status: "business_rule_error", message: "Cannot deactivate the last remaining Super Admin." };
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id }, data: { isActive } });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: isActive ? "ACTIVATE" : "DEACTIVATE",
          entityType: "USER",
          entityId: updated.id,
          reference: updated.email,
          summary: `${session.user.name} ${isActive ? "activated" : "deactivated"} user "${updated.name}".`,
        },
        tx
      );
      return updated;
    });

    revalidatePath("/admin/users");
    return { status: "success", user: serializeUser(user) };
  } catch (error) {
    console.error("setUserStatus failed:", error);
    return { status: "error", message: "Could not update the user's status. Please try again." };
  }
}

export async function resetUserPassword(id: string, newPassword: string): Promise<UserActionState> {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;
  const { session } = guard;

  const passwordResult = validateNewPassword(newPassword);
  if ("error" in passwordResult) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: [passwordResult.error] };
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This user could not be found." };
  }

  try {
    const passwordHash = await hashPassword(passwordResult.password);

    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({ where: { userId: id, providerId: "credential" }, select: { id: true } });
      if (account) {
        await tx.account.update({ where: { id: account.id }, data: { password: passwordHash } });
      } else {
        await tx.account.create({
          data: { userId: id, accountId: existing.email, providerId: "credential", password: passwordHash },
        });
      }
      // Every existing session for this user is invalidated — a password
      // reset should force re-authentication everywhere, the same
      // guarantee already documented (but not yet built) for the
      // self-service Reset Password flow, docs/API.md §9.
      await tx.session.deleteMany({ where: { userId: id } });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "PASSWORD_RESET",
          entityType: "USER",
          entityId: existing.id,
          reference: existing.email,
          summary: `${session.user.name} reset the password for "${existing.name}".`,
        },
        tx
      );
    });

    revalidatePath("/admin/users");
    return { status: "success", user: serializeUser(existing) };
  } catch (error) {
    console.error("resetUserPassword failed:", error);
    return { status: "error", message: "Could not reset the password. Please try again." };
  }
}
