CREATE TYPE "MotorPhase" AS ENUM ('SINGLE_PHASE', 'THREE_PHASE', 'OTHER');

ALTER TABLE "motors"
  ADD COLUMN "rpm" VARCHAR(80),
  ADD COLUMN "phase" "MotorPhase" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN "motor_type" VARCHAR(120),
  ADD COLUMN "frame_size" VARCHAR(120),
  ADD COLUMN "mounting_type" VARCHAR(120);

ALTER TABLE "repairs"
  ADD COLUMN "customer_id" UUID,
  ADD COLUMN "phase" "MotorPhase" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN "power" VARCHAR(80),
  ADD COLUMN "voltage" VARCHAR(80),
  ADD COLUMN "rpm" VARCHAR(80),
  ADD COLUMN "number_of_slots" VARCHAR(80),
  ADD COLUMN "starting_wire_size" VARCHAR(80),
  ADD COLUMN "running_wire_size" VARCHAR(80),
  ADD COLUMN "wire_size" VARCHAR(80),
  ADD COLUMN "starting_coil_pitch" VARCHAR(80),
  ADD COLUMN "running_coil_pitch" VARCHAR(80),
  ADD COLUMN "coil_pitch" VARCHAR(80),
  ADD COLUMN "starting_turns" VARCHAR(80),
  ADD COLUMN "running_turns" VARCHAR(80),
  ADD COLUMN "number_of_turns" VARCHAR(80),
  ADD COLUMN "inspection" JSONB,
  ADD COLUMN "custom_fields" JSONB,
  ADD COLUMN "additional_notes" TEXT,
  ADD COLUMN "deleted_at" TIMESTAMP(3);

UPDATE "repairs"
SET "customer_id" = "motors"."customer_id"
FROM "motors"
WHERE "repairs"."motor_id" = "motors"."id"
  AND "repairs"."customer_id" IS NULL;

ALTER TABLE "repairs" ALTER COLUMN "customer_id" SET NOT NULL;

CREATE TABLE "repair_costs" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "repair_id" UUID NOT NULL,
  "copper_wire_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "labor_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "spare_parts_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "other_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "repair_costs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "repair_costs_repair_id_key" ON "repair_costs"("repair_id");
CREATE INDEX "motors_phase_idx" ON "motors"("phase");
CREATE INDEX "repairs_customer_id_idx" ON "repairs"("customer_id");
CREATE INDEX "repairs_phase_idx" ON "repairs"("phase");
CREATE INDEX "repairs_deleted_at_idx" ON "repairs"("deleted_at");

ALTER TABLE "repairs" ADD CONSTRAINT "repairs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "repair_costs" ADD CONSTRAINT "repair_costs_repair_id_fkey" FOREIGN KEY ("repair_id") REFERENCES "repairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
