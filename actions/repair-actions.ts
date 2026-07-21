"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/session";
import { AuditService } from "@/services/audit-service";
import { NotificationService } from "@/services/notification-service";
import { RepairService } from "@/services/repair-service";
import { repairInputSchema } from "@/features/repairs/schemas/repair-schema";

async function requireUser() {
  return requireCurrentUser();
}

export async function createRepairAction(input: unknown) {
  const user = await requireUser();
  const data = repairInputSchema.parse(input);
  const repair = await RepairService.create(data, user.id);
  await AuditService.record({ actorId: user.id, action: "CREATE", entityType: "Repair", entityId: repair.id, metadata: { reference: repair.reference } });
  await NotificationService.create(user.id, "New Repair Added", `Repair ${repair.reference} was created.`);
  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect(`/repairs/${repair.id}`);
}

export async function updateRepairAction(id: string, input: unknown) {
  const user = await requireUser();
  const data = repairInputSchema.parse(input);
  await RepairService.update(id, data);
  await AuditService.record({ actorId: user.id, action: "UPDATE", entityType: "Repair", entityId: id });
  if (data.status === "COMPLETED") {
    await NotificationService.create(user.id, "Repair Completed", `Repair record ${id} was marked completed.`);
  }
  if (data.paymentStatus === "PAID") {
    await NotificationService.create(user.id, "Payment Received", `Payment was recorded for repair ${id}.`);
  }
  revalidatePath(`/repairs/${id}`);
  revalidatePath("/search");
  redirect(`/repairs/${id}`);
}

export async function deleteRepairAction(id: string) {
  const user = await requireUser();
  await RepairService.softDelete(id);
  await AuditService.record({ actorId: user.id, action: "DELETE", entityType: "Repair", entityId: id });
  revalidatePath("/dashboard");
  revalidatePath("/search");
  redirect("/search");
}
