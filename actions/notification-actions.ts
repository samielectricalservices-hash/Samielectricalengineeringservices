"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/session";
import { NotificationService } from "@/services/notification-service";

export async function markNotificationsReadAction() {
  const user = await requireCurrentUser();
  await NotificationService.markAllRead(user.id);
  revalidatePath("/dashboard");
}
