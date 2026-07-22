/**
 * CSV serialization for the Sales Report export (this task's §6). Pure,
 * dependency-free formatting — no new npm package, matching this
 * project's existing "don't add a dependency unless the need is genuine"
 * discipline (the one prior addition, @tanstack/react-table, was a
 * headless *library* need; a CSV writer for eight columns does not
 * warrant one). Columns exactly match the on-screen Sales Report table
 * (this task's §3), so the export is recognizably "the same report," not
 * a different shape.
 */
import type { SaleDTO } from "@/lib/sales/dto";

const COLUMNS = ["Invoice", "Date", "Retailer", "Product", "Quantity", "Amount", "Payment Status", "Outstanding"];

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function saleToRow(sale: SaleDTO): string[] {
  return [
    sale.invoiceNumber || sale.saleNumber,
    sale.invoiceDate,
    sale.retailerName,
    sale.productName,
    String(sale.quantity),
    sale.totalAmount.toFixed(2),
    sale.paymentStatus,
    sale.outstandingAmount.toFixed(2),
  ];
}

/** Builds the full CSV text (header + one row per sale). `\r\n` line
 * endings per the CSV spec (RFC 4180), so the file opens cleanly in
 * Excel/Sheets on any OS. */
export function buildSalesReportCsv(sales: SaleDTO[]): string {
  const lines = [COLUMNS.map(escapeCsvField).join(",")];
  for (const sale of sales) {
    lines.push(saleToRow(sale).map(escapeCsvField).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}
