import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { BusinessService } from "@/services/business-service";
import { PdfService } from "@/services/pdf-service";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = new URL(request.url).searchParams.get("type") ?? "Financial Report";
  const summary = await BusinessService.summary();
  const rows = [
    `Sami Electrical Engineering Services - ${type}`,
    `Date: ${new Date().toLocaleDateString()}`,
    ...Object.entries(summary).flatMap(([label, value]) => [
      `${label.toUpperCase()} Repairs: ${value.repairs}`,
      `${label.toUpperCase()} Income: ${value.income.toFixed(2)}`,
      `${label.toUpperCase()} Expenses: ${value.expenses.toFixed(2)}`,
      `${label.toUpperCase()} Profit: ${value.profit.toFixed(2)}`
    ]),
    "Signature: __________________________"
  ];
  return new NextResponse(PdfService.simplePdf(rows), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${type.replaceAll(" ", "-").toLowerCase()}.pdf"` } });
}
