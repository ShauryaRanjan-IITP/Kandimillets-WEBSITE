import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import { getProductOptionsForSalesForm, getRetailerOptionsForSalesForm, getSales } from "@/lib/sales/queries";
import SalesRegisterView from "@/components/admin/sales/SalesRegisterView";

export const metadata: Metadata = {
  title: "Sales Register",
};

// Phase 2C: real data. Reads happen here, directly in the Server
// Component, per docs/API.md §3's read-path convention — no Server Action,
// no client round-trip. Mutations (Create/Update/Void) are Server Actions
// in ./actions.ts. Session is re-verified here (in addition to the proxy)
// as defense-in-depth, matching the existing pattern on /admin/dashboard.
export default async function AdminSalesPage() {
  await requireAdminSession();

  const sales = await getSales();
  const [retailers, products] = await Promise.all([
    getRetailerOptionsForSalesForm(sales),
    getProductOptionsForSalesForm(sales),
  ]);

  return <SalesRegisterView initialSales={sales} retailers={retailers} products={products} />;
}
