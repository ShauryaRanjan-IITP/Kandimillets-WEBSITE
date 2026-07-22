/**
 * Sales Register reads — direct server-side data fetching, per the read
 * path in docs/API.md §3 (no Server Action, no client round-trip). Callers
 * are Server Components (src/app/admin/sales/page.tsx) today, and Server
 * Actions that need to re-read a row before mutating it (Update/Void Sale).
 */
import prisma from "@/lib/db/prisma";
import { serializeSale } from "./dto";

export async function getSales() {
  const sales = await prisma.sale.findMany({
    where: { isVoided: false },
    include: { retailer: true, product: true },
    orderBy: { invoiceDate: "desc" },
  });
  return sales.map(serializeSale);
}

/** Pending Payments widget (docs/DASHBOARD.md §7) — non-voided sales with
 * an outstanding balance, most urgent (soonest/most overdue due date)
 * first. A filtered/limited facet of the same Sale read as getSales(),
 * not a separate business rule. */
export async function getPendingPaymentSales(limit = 10) {
  const sales = await prisma.sale.findMany({
    where: { isVoided: false, paymentStatus: { in: ["PENDING", "PARTIAL"] } },
    include: { retailer: true, product: true },
    orderBy: { dueDate: "asc" },
    take: limit,
  });
  return sales.map(serializeSale);
}

/** Recent Sales widget (docs/DASHBOARD.md §8) — most recently *created*
 * sales, not most recent by invoice date (see docs/API.md §5's Recent
 * Sales contract for why). */
export async function getRecentSales(limit = 8) {
  const sales = await prisma.sale.findMany({
    where: { isVoided: false },
    include: { retailer: true, product: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return sales.map(serializeSale);
}

export interface SaleActivityEntry {
  id: string;
  saleNumber: string;
  retailerName: string;
  action: "created" | "edited" | "voided";
  actorName: string;
  /** ISO timestamp of the event (createdAt for "created", updatedAt otherwise). */
  timestamp: string;
}

/** Recent Activity widget (docs/DASHBOARD.md §9) — derived entirely from
 * fields the Sale table already has (createdAt/updatedAt/isVoided plus
 * the createdByUser/updatedByUser relations); no SaleAuditLog exists yet,
 * so this is the honest, reduced-scope feed the doc describes rather than
 * an invented audit trail. Voided rows are intentionally included (a void
 * is itself an activity event) even though every other read here excludes
 * them. */
export async function getRecentSaleActivity(limit = 8): Promise<SaleActivityEntry[]> {
  const sales = await prisma.sale.findMany({
    include: { retailer: true, createdByUser: true, updatedByUser: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return sales.map((sale) => {
    const wasEditedAfterCreate = sale.updatedAt.getTime() - sale.createdAt.getTime() > 5000;
    const action: SaleActivityEntry["action"] = sale.isVoided ? "voided" : wasEditedAfterCreate ? "edited" : "created";
    const actor = action === "created" ? sale.createdByUser : sale.updatedByUser ?? sale.createdByUser;
    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      retailerName: sale.retailer.name,
      action,
      actorName: actor.name,
      timestamp: sale.updatedAt.toISOString(),
    };
  });
}

export async function getSaleById(id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { retailer: true, product: true },
  });
  return sale ? serializeSale(sale) : null;
}

export async function getRetailerOptions() {
  const retailers = await prisma.retailer.findMany({
    where: { isActive: true },
    select: { id: true, name: true, city: true, state: true },
    orderBy: { name: "asc" },
  });
  return retailers;
}

/** Retailer options for the Add/Edit Sale form — Active retailers, plus
 * (Retailer Management module) any retailer already referenced by the
 * sales passed in even if it has since been deactivated. Deactivating a
 * retailer must not silently blank out or corrupt the retailer selection
 * on a sale created while it was still active — see docs' "do not lose
 * existing relationships with Sales." New sales still only ever get an
 * Active retailer, because deactivated ones are excluded from this list
 * except for that one carve-out. */
export async function getRetailerOptionsForSalesForm(sales: Array<{ retailerId: string }>) {
  const referencedIds = [...new Set(sales.map((sale) => sale.retailerId))];
  const retailers = await prisma.retailer.findMany({
    where: { OR: [{ isActive: true }, { id: { in: referencedIds } }] },
    select: { id: true, name: true, city: true, state: true, isActive: true },
    orderBy: { name: "asc" },
  });
  return retailers;
}

/** Retailer Detail page's Recent Sales table (this task's "Retailer
 * Details" §6) — same shape/pattern as getRecentSales, scoped to one
 * retailer. */
export async function getSalesByRetailer(retailerId: string, limit = 10) {
  const sales = await prisma.sale.findMany({
    where: { retailerId, isVoided: false },
    include: { retailer: true, product: true },
    orderBy: { invoiceDate: "desc" },
    take: limit,
  });
  return sales.map(serializeSale);
}

export async function getProductOptions() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, category: true, defaultUnit: true },
    orderBy: { name: "asc" },
  });
  return products;
}

/** Product options for the Add/Edit Sale form — Active products, plus
 * (Product Management module) any product already referenced by the sales
 * passed in even if it has since been deactivated. Same carve-out as
 * getRetailerOptionsForSalesForm above, for the identical reason: a
 * deactivated product must not silently blank out or corrupt the product
 * selection on a sale created while it was still active. New sales still
 * only ever get an Active product. */
export async function getProductOptionsForSalesForm(sales: Array<{ productId: string }>) {
  const referencedIds = [...new Set(sales.map((sale) => sale.productId))];
  const products = await prisma.product.findMany({
    where: { OR: [{ isActive: true }, { id: { in: referencedIds } }] },
    select: { id: true, name: true, category: true, defaultUnit: true, isActive: true },
    orderBy: { name: "asc" },
  });
  return products;
}

/** Product Detail page's Recent Sales table (this task's "Product Detail
 * Page" §6) — same shape/pattern as getSalesByRetailer, scoped to one
 * product. */
export async function getSalesByProduct(productId: string, limit = 10) {
  const sales = await prisma.sale.findMany({
    where: { productId, isVoided: false },
    include: { retailer: true, product: true },
    orderBy: { invoiceDate: "desc" },
    take: limit,
  });
  return sales.map(serializeSale);
}
