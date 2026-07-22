/**
 * Sale Number generation — immutable, unique, system-generated identifier,
 * format SAL-{year}-{6-digit sequence}, sequence resets each calendar year.
 * See docs/SALES_REGISTER.md §3. Never accepted as client input.
 */
import type { Prisma } from "@/generated/prisma/client";

function pad(n: number): string {
  return String(n).padStart(6, "0");
}

export async function generateSaleNumber(tx: Prisma.TransactionClient, year: number): Promise<string> {
  const prefix = `SAL-${year}-`;
  const latest = await tx.sale.findFirst({
    where: { saleNumber: { startsWith: prefix } },
    orderBy: { saleNumber: "desc" },
    select: { saleNumber: true },
  });

  const nextSequence = latest ? Number(latest.saleNumber.slice(prefix.length)) + 1 : 1;
  return `${prefix}${pad(nextSequence)}`;
}
