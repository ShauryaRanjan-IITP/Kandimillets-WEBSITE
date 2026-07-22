-- Product Management module — additive schema extension (see
-- docs/SALES_REGISTER.md §3, docs/API.md §7). No destructive changes:
-- every new column is nullable, existing "product" rows and the existing
-- Sale.productId relationship are untouched.
--
-- `sku` is unique at the database level while remaining nullable — Postgres
-- allows multiple NULLs under a unique constraint, so pre-existing seeded
-- products without a SKU are unaffected; the module's "SKU is required"
-- rule is enforced in application validation for new/edited products, the
-- same pattern already used for Retailer.phone.

-- AlterTable
ALTER TABLE "product" ADD COLUMN "sku" TEXT;
ALTER TABLE "product" ADD COLUMN "sellingPrice" DECIMAL(12,2);
ALTER TABLE "product" ADD COLUMN "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");
CREATE INDEX "product_name_idx" ON "product"("name");
