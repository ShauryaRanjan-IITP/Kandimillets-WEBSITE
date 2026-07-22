-- Drop the unique index on sale.invoiceNumber, which the initial
-- 20260715165233_sales_register_data_foundation migration created but
-- schema.prisma no longer declares @unique for (Invoice Number is
-- optional and often left blank, so multiple sales legitimately share
-- the same value). Leaving the stale index in place caused every sale
-- after the first blank/duplicate invoiceNumber to fail with P2002.
DROP INDEX IF EXISTS "sale_invoiceNumber_key";
