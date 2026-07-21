import { prisma } from "@/lib/prisma";

type RepairPdfRecord = {
  reference: string;
  phase: string;
  power?: string | null;
  voltage?: string | null;
  rpm?: string | null;
  status: string;
  priority?: string | null;
  repairNotes?: string | null;
  additionalNotes?: string | null;
  customer: { name: string; phone?: string | null };
  motor: { motorType?: string | null };
  cost?: { totalCost?: unknown; customerCharge?: unknown; profit?: unknown } | null;
  assignee?: { name?: string | null } | null;
};

function escapePdf(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function line(text: string, y: number) {
  return `BT /F1 10 Tf 50 ${y} Td (${escapePdf(text)}) Tj ET`;
}

export class PdfService {
  static async repairPdf(repairId: string, type: string) {
    const repair = await prisma.repair.findFirst({
      where: { id: repairId, deletedAt: null } as never,
      include: { customer: true, motor: true, cost: true, photos: true, assignee: true } as never
    }) as unknown as RepairPdfRecord | null;
    if (!repair) throw new Error("Repair not found.");

    const title = type.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const rows = [
      `Sami Electrical Engineering Services - ${title}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Customer: ${repair.customer.name}`,
      `Phone: ${repair.customer.phone ?? "-"}`,
      `Job Number: ${repair.reference}`,
      `Motor: ${repair.motor.motorType ?? repair.phase}`,
      `Power: ${repair.power ?? "-"} Voltage: ${repair.voltage ?? "-"} RPM: ${repair.rpm ?? "-"}`,
      `Status: ${repair.status} Priority: ${repair.priority}`,
      `Technician: ${repair.assignee?.name ?? "-"}`,
      `Total Expenses: ${Number(repair.cost?.totalCost ?? 0).toFixed(2)}`,
      `Customer Charge: ${Number(repair.cost?.customerCharge ?? 0).toFixed(2)}`,
      `Profit: ${Number(repair.cost?.profit ?? 0).toFixed(2)}`,
      `Notes: ${repair.repairNotes ?? repair.additionalNotes ?? "-"}`,
      "Signature: __________________________"
    ];
    return this.simplePdf(rows);
  }

  static simplePdf(rows: string[]) {
    const content = rows.map((row, index) => line(row, 760 - index * 24)).join("\n");
    const objects = [
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
      "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
      `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
    ];
    let offset = "%PDF-1.4\n".length;
    const xref = objects.map((obj) => {
      const current = offset;
      offset += obj.length + 1;
      return current;
    });
    const body = objects.join("\n");
    const table = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f ", ...xref.map((n) => `${String(n).padStart(10, "0")} 00000 n `)].join("\n");
    const start = "%PDF-1.4\n".length + body.length + 1;
    return Buffer.from(`%PDF-1.4\n${body}\n${table}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
  }
}
