export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { searchRepairSchema } from "@/features/repairs/schemas/repair-schema";
import { RepairService } from "@/services/repair-service";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const parsed = searchRepairSchema.parse(Object.fromEntries(url.searchParams));
  return NextResponse.json(await RepairService.search(parsed));
}
