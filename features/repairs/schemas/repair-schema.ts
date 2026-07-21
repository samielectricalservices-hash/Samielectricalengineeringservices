import { z } from "zod";

export const repairPhaseSchema = z.enum(["SINGLE_PHASE", "THREE_PHASE", "OTHER"]);
export const repairStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_PARTS", "TESTING", "COMPLETED", "DELIVERED", "CANCELLED"]);
export const repairPrioritySchema = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);
export const paymentStatusSchema = z.enum(["UNPAID", "PARTIAL", "PAID"]);
export const paymentMethodSchema = z.enum(["CASH", "BANK_TRANSFER", "MOBILE_PAYMENT", "OTHER"]);

const text = z.string().trim().optional().default("");
const money = z.coerce.number().min(0).default(0);

export const repairInputSchema = z.object({
  phase: repairPhaseSchema,
  status: repairStatusSchema.default("OPEN"),
  priority: repairPrioritySchema.default("NORMAL"),
  customerName: z.string().trim().min(2, "Customer name is required."),
  phoneNumber: z.string().trim().min(3, "Phone number is required."),
  address: text,
  jobNumber: text,
  power: text,
  voltage: text,
  rpm: text,
  numberOfSlots: text,
  startingWireSize: text,
  runningWireSize: text,
  wireSize: text,
  startingCoilPitch: text,
  runningCoilPitch: text,
  coilPitch: text,
  startingTurns: text,
  runningTurns: text,
  numberOfTurns: text,
  motorType: text,
  manufacturer: text,
  frameSize: text,
  mountingType: text,
  motorCategory: text,
  inspection: z.record(z.string(), z.string()).default({}),
  customFields: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Custom field label is required."),
        value: z.string().trim().optional().default("")
      })
    )
    .max(10)
    .default([]),
  additionalNotes: text,
  repairNotes: text,
  internalNotes: text,
  startDate: text,
  expectedCompletionDate: text,
  deliveryDate: text,
  copperWireCost: money,
  laborCost: money,
  bearingCost: money,
  capacitorCost: money,
  sparePartsCost: money,
  transportationCost: money,
  otherCost: money,
  customerCharge: money,
  discount: money,
  paymentStatus: paymentStatusSchema.default("UNPAID"),
  paymentMethod: paymentMethodSchema.optional(),
  photos: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string(),
        contentType: z.string(),
        sizeBytes: z.number()
      })
    )
    .max(4)
    .default([])
});

export const searchRepairSchema = z.object({
  q: text,
  customerName: text,
  phoneNumber: text,
  jobNumber: text,
  motorType: text,
  power: text,
  voltage: text,
  rpm: text,
  phase: z.enum(["", "SINGLE_PHASE", "THREE_PHASE", "OTHER"]).optional().default(""),
  date: text,
  status: z.enum(["", "OPEN", "IN_PROGRESS", "WAITING_FOR_PARTS", "TESTING", "COMPLETED", "DELIVERED", "CANCELLED"]).optional().default(""),
  sort: z.enum(["newest", "oldest", "customer", "status"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10)
});

export type RepairInput = z.infer<typeof repairInputSchema>;
export type SearchRepairInput = z.infer<typeof searchRepairSchema>;
