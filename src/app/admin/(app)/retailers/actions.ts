"use server";

/**
 * Retailer Management Server Actions — follows the exact
 * sanitize -> validate -> business logic -> Prisma chain and response
 * shape already established by src/app/admin/(app)/sales/actions.ts
 * (itself mandated by docs/API.md §3/§4), reused rather than reinvented.
 *
 * Every action independently re-verifies the caller's session server-side
 * (docs/API.md §2/§12) — the proxy's cookie check is a fast gate, not the
 * sole authority.
 */
import { revalidatePath } from "next/cache";
import { getSessionSafe } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { serializeRetailer, type RetailerDTO } from "@/lib/retailers/dto";
import { findDuplicateRetailer } from "@/lib/retailers/queries";
import {
  validateRetailerInput,
  type RetailerInput,
  type ValidationError,
} from "@/lib/retailers/validation";
import { writeAuditLog } from "@/lib/audit/log";

export type RetailerActionState =
  | { status: "success"; retailer: RetailerDTO }
  | { status: "validation_error"; message: string; errors: ValidationError[] }
  | { status: "auth_error"; message: string }
  | { status: "business_rule_error"; message: string }
  | { status: "error"; message: string };

async function requireSession() {
  return getSessionSafe();
}

export async function createRetailer(input: RetailerInput): Promise<RetailerActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to create a retailer." };
  }

  const result = validateRetailerInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const duplicate = await findDuplicateRetailer(data.name, data.phone);
  if (duplicate) {
    return {
      status: "business_rule_error",
      message: `A retailer named "${data.name}" with this phone number already exists.`,
    };
  }

  try {
    const retailer = await prisma.$transaction(async (tx) => {
      const created = await tx.retailer.create({ data });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "CREATE",
          entityType: "RETAILER",
          entityId: created.id,
          reference: created.name,
          summary: `${session.user.name} created retailer "${created.name}".`,
        },
        tx
      );
      return created;
    });
    revalidatePath("/admin/retailers");
    return { status: "success", retailer: serializeRetailer(retailer) };
  } catch (error) {
    console.error("createRetailer failed:", error);
    return { status: "error", message: "Could not save the retailer. Please try again." };
  }
}

export async function updateRetailer(id: string, input: RetailerInput): Promise<RetailerActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to edit a retailer." };
  }

  const existing = await prisma.retailer.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This retailer could not be found." };
  }

  const result = validateRetailerInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const duplicate = await findDuplicateRetailer(data.name, data.phone, id);
  if (duplicate) {
    return {
      status: "business_rule_error",
      message: `A retailer named "${data.name}" with this phone number already exists.`,
    };
  }

  try {
    // Sale.retailerId is untouched — editing a retailer's own fields
    // never re-points or duplicates its existing Sale relationships.
    const retailer = await prisma.$transaction(async (tx) => {
      const updated = await tx.retailer.update({ where: { id }, data });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "UPDATE",
          entityType: "RETAILER",
          entityId: updated.id,
          reference: updated.name,
          summary: `${session.user.name} updated retailer "${updated.name}".`,
        },
        tx
      );
      return updated;
    });
    revalidatePath("/admin/retailers");
    revalidatePath(`/admin/retailers/${id}`);
    return { status: "success", retailer: serializeRetailer(retailer) };
  } catch (error) {
    console.error("updateRetailer failed:", error);
    return { status: "error", message: "Could not save the changes. Please try again." };
  }
}

/** Activate/deactivate — never a hard delete, per this task's explicit
 * "Deactivate Retailer" spec. A deactivated retailer stays searchable and
 * stays linked to every historic sale; it simply stops appearing as a
 * choice for new sales (src/lib/sales/queries.ts's getRetailerOptions
 * already filters to isActive only). */
export async function setRetailerStatus(id: string, isActive: boolean): Promise<RetailerActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to change a retailer's status." };
  }

  const existing = await prisma.retailer.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This retailer could not be found." };
  }
  if (existing.isActive === isActive) {
    return {
      status: "business_rule_error",
      message: `This retailer is already ${isActive ? "active" : "inactive"}.`,
    };
  }

  try {
    const retailer = await prisma.$transaction(async (tx) => {
      const updated = await tx.retailer.update({ where: { id }, data: { isActive } });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: isActive ? "ACTIVATE" : "DEACTIVATE",
          entityType: "RETAILER",
          entityId: updated.id,
          reference: updated.name,
          summary: `${session.user.name} ${isActive ? "activated" : "deactivated"} retailer "${updated.name}".`,
        },
        tx
      );
      return updated;
    });
    revalidatePath("/admin/retailers");
    revalidatePath(`/admin/retailers/${id}`);
    return { status: "success", retailer: serializeRetailer(retailer) };
  } catch (error) {
    console.error("setRetailerStatus failed:", error);
    return { status: "error", message: "Could not update the retailer's status. Please try again." };
  }
}
