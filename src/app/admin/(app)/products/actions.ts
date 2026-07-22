"use server";

/**
 * Product Management Server Actions — follows the exact
 * sanitize -> validate -> business logic -> Prisma chain and response
 * shape already established by src/app/admin/(app)/retailers/actions.ts
 * (itself mandated by docs/API.md §3/§4), reused rather than reinvented.
 *
 * Every action independently re-verifies the caller's session server-side
 * (docs/API.md §2/§12) — the proxy's cookie check is a fast gate, not the
 * sole authority.
 */
import { revalidatePath } from "next/cache";
import { getSessionSafe } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { serializeProduct, type ProductDTO } from "@/lib/products/dto";
import { findDuplicateProduct } from "@/lib/products/queries";
import {
  validateProductInput,
  type ProductInput,
  type ValidationError,
} from "@/lib/products/validation";
import { writeAuditLog } from "@/lib/audit/log";

export type ProductActionState =
  | { status: "success"; product: ProductDTO }
  | { status: "validation_error"; message: string; errors: ValidationError[] }
  | { status: "auth_error"; message: string }
  | { status: "business_rule_error"; message: string }
  | { status: "error"; message: string };

async function requireSession() {
  return getSessionSafe();
}

export async function createProduct(input: ProductInput): Promise<ProductActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to create a product." };
  }

  const result = validateProductInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const duplicate = await findDuplicateProduct(data.name, data.sku);
  if (duplicate) {
    return {
      status: "business_rule_error",
      message: `A product named "${data.name}" or with SKU "${data.sku}" already exists.`,
    };
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "CREATE",
          entityType: "PRODUCT",
          entityId: created.id,
          reference: created.sku ? `${created.name} (${created.sku})` : created.name,
          summary: `${session.user.name} created product "${created.name}".`,
        },
        tx
      );
      return created;
    });
    revalidatePath("/admin/products");
    return { status: "success", product: serializeProduct(product) };
  } catch (error) {
    console.error("createProduct failed:", error);
    return { status: "error", message: "Could not save the product. Please try again." };
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ProductActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to edit a product." };
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This product could not be found." };
  }

  const result = validateProductInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const duplicate = await findDuplicateProduct(data.name, data.sku, id);
  if (duplicate) {
    return {
      status: "business_rule_error",
      message: `A product named "${data.name}" or with SKU "${data.sku}" already exists.`,
    };
  }

  try {
    // Sale.productId is untouched — editing a product's own fields never
    // re-points or duplicates its existing Sale relationships.
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({ where: { id }, data });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "UPDATE",
          entityType: "PRODUCT",
          entityId: updated.id,
          reference: updated.sku ? `${updated.name} (${updated.sku})` : updated.name,
          summary: `${session.user.name} updated product "${updated.name}".`,
        },
        tx
      );
      return updated;
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { status: "success", product: serializeProduct(product) };
  } catch (error) {
    console.error("updateProduct failed:", error);
    return { status: "error", message: "Could not save the changes. Please try again." };
  }
}

/** Activate/deactivate — never a hard delete, per this task's explicit
 * "Deactivate Product" spec. A deactivated product stays visible/searchable
 * and stays linked to every historic sale; it simply stops appearing as a
 * choice for new sales (src/lib/sales/queries.ts's getProductOptionsForSalesForm
 * already filters to isActive only). */
export async function setProductStatus(id: string, isActive: boolean): Promise<ProductActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to change a product's status." };
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This product could not be found." };
  }
  if (existing.isActive === isActive) {
    return {
      status: "business_rule_error",
      message: `This product is already ${isActive ? "active" : "inactive"}.`,
    };
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({ where: { id }, data: { isActive } });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: isActive ? "ACTIVATE" : "DEACTIVATE",
          entityType: "PRODUCT",
          entityId: updated.id,
          reference: updated.sku ? `${updated.name} (${updated.sku})` : updated.name,
          summary: `${session.user.name} ${isActive ? "activated" : "deactivated"} product "${updated.name}".`,
        },
        tx
      );
      return updated;
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { status: "success", product: serializeProduct(product) };
  } catch (error) {
    console.error("setProductStatus failed:", error);
    return { status: "error", message: "Could not update the product's status. Please try again." };
  }
}
