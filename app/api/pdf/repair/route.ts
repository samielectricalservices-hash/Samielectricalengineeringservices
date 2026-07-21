import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { PdfService } from "@/services/pdf-service";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type") ?? "repair-report";
  if (!id) return NextResponse.json({ error: "Repair id is required." }, { status: 400 });
  const pdf = await PdfService.repairPdf(id, type);
  return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${type}.pdf"` } });
}
