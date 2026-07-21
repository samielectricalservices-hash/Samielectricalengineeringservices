import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RepairForm } from "@/features/repairs/components/repair-form";
import { RepairService } from "@/services/repair-service";

export const dynamic = "force-dynamic";

type RepairForEdit = {
  id: string;
  phase: "SINGLE_PHASE" | "THREE_PHASE" | "OTHER";
  status: string;
  priority?: string | null;
  reference: string;
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
  customer: { name: string; phone?: string | null; address?: string | null };
  motor: { motorType?: string | null; manufacturer?: string | null; frameSize?: string | null; mountingType?: string | null; model?: string | null };
  cost?: { copperWireCost?: unknown; laborCost?: unknown; bearingCost?: unknown; capacitorCost?: unknown; sparePartsCost?: unknown; transportationCost?: unknown; otherCost?: unknown; customerCharge?: unknown; discount?: unknown; paymentStatus?: string | null; paymentMethod?: string | null } | null;
  photos: Array<{ url: string; caption?: string | null; contentType: string; sizeBytes: number }>;
};

export default async function EditRepairPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repair = await RepairService.getById(id) as RepairForEdit | null;
  if (!repair) notFound();
  const initial = {
    status: repair.status,
    priority: repair.priority,
    customerName: repair.customer.name,
    phoneNumber: repair.customer.phone,
    address: repair.customer.address,
    jobNumber: repair.reference,
    power: repair.power,
    voltage: repair.voltage,
    rpm: repair.rpm,
    numberOfSlots: repair.numberOfSlots,
    startingWireSize: repair.startingWireSize,
    runningWireSize: repair.runningWireSize,
    wireSize: repair.wireSize,
    startingCoilPitch: repair.startingCoilPitch,
    runningCoilPitch: repair.runningCoilPitch,
    coilPitch: repair.coilPitch,
    startingTurns: repair.startingTurns,
    runningTurns: repair.runningTurns,
    numberOfTurns: repair.numberOfTurns,
    motorType: repair.motor.motorType,
    manufacturer: repair.motor.manufacturer,
    frameSize: repair.motor.frameSize,
    mountingType: repair.motor.mountingType,
    motorCategory: repair.motor.model,
    inspection: Object.fromEntries(
      Object.entries(repair.inspection ?? {}).map(([key, value]) => [key, String(value ?? "")])
    ),
    customFields: repair.customFields?.map((field) => ({ label: field.label, value: field.value ?? "" })) ?? undefined,
    additionalNotes: repair.additionalNotes,
    repairNotes: repair.repairNotes,
    internalNotes: repair.internalNotes,
    startDate: repair.startDate ? new Date(repair.startDate).toISOString().slice(0, 10) : "",
    expectedCompletionDate: repair.expectedCompletionDate ? new Date(repair.expectedCompletionDate).toISOString().slice(0, 10) : "",
    deliveryDate: repair.deliveryDate ? new Date(repair.deliveryDate).toISOString().slice(0, 10) : "",
    copperWireCost: repair.cost?.copperWireCost,
    laborCost: repair.cost?.laborCost,
    bearingCost: repair.cost?.bearingCost,
    capacitorCost: repair.cost?.capacitorCost,
    sparePartsCost: repair.cost?.sparePartsCost,
    transportationCost: repair.cost?.transportationCost,
    otherCost: repair.cost?.otherCost,
    customerCharge: repair.cost?.customerCharge,
    discount: repair.cost?.discount,
    paymentStatus: repair.cost?.paymentStatus,
    paymentMethod: repair.cost?.paymentMethod,
    photos: repair.photos.map((photo) => ({ url: photo.url, caption: photo.caption ?? "Photo", contentType: photo.contentType, sizeBytes: photo.sizeBytes }))
  };

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Edit Repair Record</h1>
        <p className="mt-2 text-sm text-muted-foreground">{repair.reference}</p>
      </div>
      <RepairForm phase={repair.phase} initial={initial} repairId={repair.id} />
    </AppShell>
  );
}
