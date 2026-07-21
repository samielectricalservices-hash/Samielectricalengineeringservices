CREATE TYPE "RepairPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER');

ALTER TYPE "RepairStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_PARTS';
ALTER TYPE "RepairStatus" ADD VALUE IF NOT EXISTS 'TESTING';
ALTER TYPE "RepairStatus" ADD VALUE IF NOT EXISTS 'DELIVERED';

ALTER TABLE "repairs"
  ADD COLUMN "priority" "RepairPriority" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "repair_notes" TEXT,
  ADD COLUMN "internal_notes" TEXT,
  ADD COLUMN "start_date" TIMESTAMP(3),
  ADD COLUMN "expected_completion_date" TIMESTAMP(3),
  ADD COLUMN "delivery_date" TIMESTAMP(3);

ALTER TABLE "repair_costs"
  ADD COLUMN "bearing_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "capacitor_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "transportation_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "customer_charge" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "final_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "profit" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN "payment_method" "PaymentMethod";

UPDATE "repair_costs"
SET "final_amount" = "total_cost",
    "profit" = COALESCE("customer_charge", 0) - COALESCE("total_cost", 0);

CREATE INDEX "repairs_priority_idx" ON "repairs"("priority");
CREATE INDEX "repairs_start_date_idx" ON "repairs"("start_date");
CREATE INDEX "repairs_delivery_date_idx" ON "repairs"("delivery_date");
CREATE INDEX "repair_costs_payment_status_idx" ON "repair_costs"("payment_status");
