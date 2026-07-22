/**
 * Sales Report CSV export — this task's §6. A GET Route Handler, not a
 * Server Action, because a browser file download needs a real HTTP
 * response with `Content-Type`/`Content-Disposition` headers — the same
 * kind of non-page, non-Server-Action output this codebase already
 * produces via `app/sitemap.ts`/`app/robots.ts` (see ARCHITECTURE.md §3).
 * This is not a REST data API for the app's own frontend (docs/API.md
 * §2's general preference for Server Actions is about *data reads*, not
 * file downloads) — it exists solely so `<a href>` can trigger a native
 * browser download.
 *
 * Reuses the exact same filter-parsing and query functions the page
 * itself uses (src/lib/reports/dateRangeParams.ts,
 * src/lib/reports/queries.ts's buildSalesReportWhere via
 * getSalesReportForExport) — never a second, hand-rolled filter
 * implementation — which is what guarantees the exported CSV always
 * matches whatever the on-screen report currently shows.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSessionSafe } from "@/lib/auth/session";
import type { PaymentStatus } from "@/generated/prisma/enums";
import { getSalesReportForExport } from "@/lib/reports/queries";
import { parseReportRangeParams } from "@/lib/reports/dateRangeParams";
import { buildSalesReportCsv } from "@/lib/reports/csv";

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "CANCELLED"];

export async function GET(request: NextRequest) {
  const session = await getSessionSafe();
  if (!session) {
    return NextResponse.json({ status: "auth_error", message: "You must be signed in to export reports." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const { range } = parseReportRangeParams({
    range: searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const retailerId = searchParams.get("retailerId") ?? undefined;
  const productId = searchParams.get("productId") ?? undefined;
  const rawStatus = searchParams.get("status");
  const paymentStatus = VALID_PAYMENT_STATUSES.includes(rawStatus as PaymentStatus)
    ? (rawStatus as PaymentStatus)
    : undefined;
  const search = searchParams.get("search") ?? undefined;

  const sales = await getSalesReportForExport({ range, retailerId, productId, paymentStatus, search });
  const csv = buildSalesReportCsv(sales);

  const filename = `sales-report-${range.from}-to-${range.to}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
