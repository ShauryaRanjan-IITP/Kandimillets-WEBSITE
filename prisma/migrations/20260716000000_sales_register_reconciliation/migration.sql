-- Phase 2C schema reconciliation (see docs/SALES_REGISTER.md revision note
-- "final design improvements" and §14 Phase 2C).
--
-- 1. PaymentStatus enum corrected: PAID/PARTIAL/UNPAID/OVERDUE ->
--    PENDING/PARTIAL/PAID/CANCELLED.
-- 2. Sale.saleNumber added: immutable, unique, system-generated identifier.
--
-- The `sale` table was verified empty immediately before authoring this
-- migration, so no data-preserving value mapping is required.

-- AlterEnum
ALTER TABLE "sale" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED');
ALTER TABLE "sale" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus" USING ("paymentStatus"::text::"PaymentStatus");
ALTER TABLE "sale" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';
DROP TYPE "PaymentStatus_old";

-- AlterTable
ALTER TABLE "sale" ADD COLUMN "saleNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sale_saleNumber_key" ON "sale"("saleNumber");
