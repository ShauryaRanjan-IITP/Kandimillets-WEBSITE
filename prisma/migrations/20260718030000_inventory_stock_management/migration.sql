-- Inventory & Stock Management module — additive schema extension (see
-- ARCHITECTURE.md Part VI roadmap, docs/SALES_REGISTER.md §3/§12 for the
-- established "additive nullable/defaulted, no destructive migration"
-- convention this follows). No existing table is altered destructively:
-- "product" gains two new columns (both defaulted/nullable), and a brand
-- new "stock_movement" table is created. Historic "sale" rows are
-- untouched — no retroactive stock movements are synthesized for them.

-- AlterTable
ALTER TABLE "product" ADD COLUMN "currentStock" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "product" ADD COLUMN "lowStockThreshold" DECIMAL(12,3);

-- CreateEnum
CREATE TYPE "StockMovementDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "StockMovementReason" AS ENUM ('INITIAL_STOCK', 'PURCHASE', 'SALE', 'SALE_EDIT', 'SALE_VOID', 'DAMAGE', 'SAMPLE', 'MANUAL_CORRECTION', 'EXPIRY');

-- CreateTable
CREATE TABLE "stock_movement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "direction" "StockMovementDirection" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "reason" "StockMovementReason" NOT NULL,
    "notes" TEXT,
    "reference" TEXT,
    "balanceAfter" DECIMAL(12,3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_movement_productId_idx" ON "stock_movement"("productId");

-- CreateIndex
CREATE INDEX "stock_movement_createdAt_idx" ON "stock_movement"("createdAt");

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
