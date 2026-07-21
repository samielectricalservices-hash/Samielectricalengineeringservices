import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit3 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/ui/confirm-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteRepairAction } from "@/actions/repair-actions";
import { RepairService } from "@/services/repair-service";

export const dynamic = "force-dynamic";

type RepairRecord = {
  id: string;
  reference: string;
  status: string;
  priority?: string | null;
  phase?: string | null;
  power?: string | null;
  voltage?: string | null;
  rpm?: string | null;
  numberOfSlots?: string | null;
  startingWireSize?: string | null;
  runningWireSize?: string | null;
  wireSize?: string | null;
  startingCoilPitch?: string | null;
  runningCoilPitch?: string | null;
  coilPitch?: string | null;
  startingTurns?: string | null;
  runningTurns?: string | null;
  numberOfTurns?: string | null;
  inspection?: Record<string, unknown> | null;
  customFields?: Array<{ label: string; value?: string }> | null;
  additionalNotes?: string | null;
  repairNotes?: string | null;
  internalNotes?: string | null;
  startDate?: Date | null;
  expectedCompletionDate?: Date | null;
  deliveryDate?: Date | null;
  createdAt: Date;
  customer: { name: string; phone?: string | null; address?: string | null };
  motor: { motorType?: string | null; manufacturer?: string | null; frameSize?: string | null; mountingType?: string | null };
  cost?: { copperWireCost?: unknown; laborCost?: unknown; bearingCost?: unknown; capacitorCost?: unknown; sparePartsCost?: unknown; transportationCost?: unknown; otherCost?: unknown; totalCost?: unknown; customerCharge?: unknown; discount?: unknown; finalAmount?: unknown; profit?: unknown; paymentStatus?: string | null; paymentMethod?: string | null } | null;
  photos: Array<{ id: string; url: string; caption?: string | null; contentType: string; sizeBytes: number }>;
  assignee?: { name?: string | null } | null;
};

export default async function RepairRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repair = await RepairService.getById(id) as RepairRecord | null;
  if (!repair) notFound();
  const inspection = repair.inspection ?? {};
  const customFields = repair.customFields ?? [];

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Repair Record</p>
          <h1 className="text-3xl font-semibold">{repair.reference}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{repair.customer.name} - {repair.customer.phone ?? "No phone"}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/repairs/${repair.id}/edit`}><Button variant="ghost"><Edit3 className="h-4 w-4" /> Edit</Button></Link>
          <ConfirmDeleteButton action={deleteRepairAction.bind(null, repair.id)} />
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {["job-card", "inspection-report", "repair-report", "customer-receipt", "invoice", "warranty-certificate", "financial-summary"].map((type) => (
          <Link key={type} href={`/api/pdf/repair?id=${repair.id}&type=${type}`} className="rounded-md border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary">
            {type.replaceAll("-", " ")}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel title="Customer Information">
            <Info label="Name" value={repair.customer.name} />
            <Info label="Phone" value={repair.customer.phone} />
            <Info label="Address" value={repair.customer.address} />
          </Panel>
          <Panel title="Motor Information">
            <Info label="Phase" value={repair.phase?.replace("_", " ")} />
            <Info label="Motor Type" value={repair.motor.motorType} />
            <Info label="Power" value={repair.power} />
            <Info label="Voltage" value={repair.voltage} />
            <Info label="RPM" value={repair.rpm} />
            <Info label="Slots" value={repair.numberOfSlots} />
            <Info label="Wire Size" value={repair.wireSize || `${repair.startingWireSize ?? ""} ${repair.runningWireSize ?? ""}`} />
            <Info label="Coil Pitch" value={repair.coilPitch || `${repair.startingCoilPitch ?? ""} ${repair.runningCoilPitch ?? ""}`} />
            <Info label="Turns" value={repair.numberOfTurns || `${repair.startingTurns ?? ""} ${repair.runningTurns ?? ""}`} />
            <Info label="Manufacturer" value={repair.motor.manufacturer} />
            <Info label="Frame Size" value={repair.motor.frameSize} />
            <Info label="Mounting Type" value={repair.motor.mountingType} />
          </Panel>
          <Panel title="Inspection">
            {Object.entries(inspection).map(([key, value]) => <Info key={key} label={key.replace(/([A-Z])/g, " $1")} value={String(value)} />)}
          </Panel>
          {customFields.length ? (
            <Panel title="Custom Fields">
              {customFields.map((field, index) => <Info key={index} label={field.label} value={field.value} />)}
            </Panel>
          ) : null}
          <Panel title="Additional Notes">
            <p className="col-span-full whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{repair.additionalNotes || "No notes recorded."}</p>
          </Panel>
        </div>
        <aside className="space-y-6">
          <Panel title="Status">
            <BadgeInfo label="Current Status"><StatusBadge value={repair.status} /></BadgeInfo>
            <BadgeInfo label="Priority"><StatusBadge type="priority" value={repair.priority ?? "NORMAL"} /></BadgeInfo>
            <Info label="Assigned To" value={repair.assignee?.name} />
            <Info label="Created" value={new Date(repair.createdAt).toLocaleDateString()} />
            <Info label="Start Date" value={repair.startDate ? new Date(repair.startDate).toLocaleDateString() : "-"} />
            <Info label="Expected Completion" value={repair.expectedCompletionDate ? new Date(repair.expectedCompletionDate).toLocaleDateString() : "-"} />
            <Info label="Delivery Date" value={repair.deliveryDate ? new Date(repair.deliveryDate).toLocaleDateString() : "-"} />
          </Panel>
          <Panel title="Costs">
            <Info label="Copper Wire" value={money(repair.cost?.copperWireCost)} />
            <Info label="Labor" value={money(repair.cost?.laborCost)} />
            <Info label="Bearing" value={money(repair.cost?.bearingCost)} />
            <Info label="Capacitor" value={money(repair.cost?.capacitorCost)} />
            <Info label="Spare Parts" value={money(repair.cost?.sparePartsCost)} />
            <Info label="Transportation" value={money(repair.cost?.transportationCost)} />
            <Info label="Other" value={money(repair.cost?.otherCost)} />
            <Info label="Total Expenses" value={money(repair.cost?.totalCost)} />
            <Info label="Customer Charge" value={money(repair.cost?.customerCharge)} />
            <Info label="Discount" value={money(repair.cost?.discount)} />
            <Info label="Final Amount" value={money(repair.cost?.finalAmount)} />
            <BadgeInfo label="Profit"><StatusBadge type="profit" value={`${money(repair.cost?.profit)} Birr`} amount={Number(repair.cost?.profit ?? 0)} /></BadgeInfo>
            <BadgeInfo label="Payment Status"><StatusBadge type="payment" value={repair.cost?.paymentStatus ?? "UNPAID"} /></BadgeInfo>
            <Info label="Payment Method" value={repair.cost?.paymentMethod?.replace("_", " ")} />
          </Panel>
          <Panel title="Photos">
            <div className="col-span-full grid gap-3">
              {repair.photos.length === 0 ? <p className="text-sm text-muted-foreground">No photos uploaded.</p> : repair.photos.map((photo) => (
                <Image key={photo.id} src={photo.url} alt={photo.caption ?? "Repair photo"} width={500} height={340} className="rounded-md border object-cover" />
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}

function money(value: unknown) {
  return Number(value ?? 0).toFixed(2);
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="business-card rounded-lg border p-5"><h2 className="mb-4 text-base font-semibold">{title}</h2><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>;
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium capitalize">{value || "-"}</p></div>;
}

function BadgeInfo({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-xs uppercase text-muted-foreground">{label}</p>{children}</div>;
}
