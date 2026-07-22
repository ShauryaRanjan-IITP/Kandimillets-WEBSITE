-- Settings, Administration & Final Platform Integration module —
-- additive schema extension. Two brand-new tables (business_settings,
-- audit_log); no existing table is altered destructively. Historic Sale/
-- Retailer/Product/StockMovement rows are untouched.

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DEACTIVATE', 'ACTIVATE', 'VOID', 'ADJUSTMENT', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'RETAILER', 'PRODUCT', 'SALE', 'STOCK_MOVEMENT', 'BUSINESS_SETTINGS', 'SESSION');

-- CreateTable
CREATE TABLE "business_settings" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "gstNumber" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'INR',
    "defaultUnit" TEXT NOT NULL DEFAULT 'kg',
    "defaultLowStockThreshold" DECIMAL(12,3),
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT,
    "reference" TEXT,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "audit_log_entityType_idx" ON "audit_log"("entityType");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- AddForeignKey
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
