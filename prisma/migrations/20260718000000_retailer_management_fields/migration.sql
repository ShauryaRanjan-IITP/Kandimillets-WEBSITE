-- Retailer Management module — additive fields only, all nullable.
-- No existing "retailer" row requires a backfill; no existing "Sale"
-- relationship is touched. See docs/ADMIN_SYSTEM.md §11's guidance on
-- non-destructive schema changes.

-- AlterTable
ALTER TABLE "retailer" ADD COLUMN "contactPerson" TEXT;
ALTER TABLE "retailer" ADD COLUMN "alternatePhone" TEXT;
ALTER TABLE "retailer" ADD COLUMN "email" TEXT;
ALTER TABLE "retailer" ADD COLUMN "address" TEXT;
ALTER TABLE "retailer" ADD COLUMN "pincode" TEXT;
ALTER TABLE "retailer" ADD COLUMN "notes" TEXT;
