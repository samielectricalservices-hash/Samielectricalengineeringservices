"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { Save, UploadCloud } from "lucide-react";
import { createRepairAction, updateRepairAction } from "@/actions/repair-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";

type Phase = "SINGLE_PHASE" | "THREE_PHASE" | "OTHER";
type Photo = { url: string; caption: string; contentType: string; sizeBytes: number };
type CustomField = { label: string; value: string };
type Costs = {
  copperWireCost: number;
  laborCost: number;
  sparePartsCost: number;
  otherCost: number;
  bearingCost: number;
  capacitorCost: number;
  transportationCost: number;
  customerCharge: number;
  discount: number;
};

const inspectionOptions: Record<string, string[]> = {
  bearingCondition: ["Excellent", "Good", "Fair", "Worn", "Damaged", "Replaced", "Other (Specify)"],
  bearingChanged: ["Yes", "No", "Repaired", "Needs Replacement", "Other (Specify)"],
  shaftCondition: ["Excellent", "Good", "Fair", "Worn", "Bent", "Damaged", "Broken", "Rusted", "Repaired", "Replaced", "Other (Specify)"],
  rotorCondition: ["Excellent", "Good", "Slight Damage", "Burned", "Short Circuit", "Open Circuit", "Cracked", "Broken Bars", "Other (Specify)"],
  statorCondition: ["Excellent", "Good", "Burned", "Moisture Damage", "Coil Damaged", "Repaired", "Rewound", "Other (Specify)"],
  fanCondition: ["Good", "Cracked", "Broken", "Missing", "Replaced", "Other (Specify)"],
  capacitorCondition: ["Good", "Weak", "Failed", "Swollen", "Leaking", "Replaced", "Not Applicable", "Other (Specify)"],
  lubrication: ["Good", "Dry", "Excessive Grease", "Re-greased", "Needs Lubrication", "Other (Specify)"],
  motorCleaning: ["Clean", "Dusty", "Dirty", "Oil Contamination", "Water Damage", "Cleaned", "Other (Specify)"],
  finalTestResult: ["Passed", "Passed with Observation", "Failed", "Requires Rework", "Waiting for Test", "Other (Specify)"]
};

const labels: Record<string, string> = {
  bearingCondition: "Bearing Condition",
  bearingChanged: "Bearing Changed",
  shaftCondition: "Shaft Condition",
  rotorCondition: "Rotor Condition",
  statorCondition: "Stator Condition",
  fanCondition: "Fan Condition",
  capacitorCondition: "Capacitor Condition",
  lubrication: "Lubrication",
  motorCleaning: "Motor Cleaning",
  finalTestResult: "Final Test Result"
};

type Initial = Record<string, unknown> & {
  photos?: Photo[];
  customFields?: CustomField[];
  inspection?: Record<string, string>;
};

const costKeys = [
  "copperWireCost",
  "laborCost",
  "sparePartsCost",
  "otherCost",
  "bearingCost",
  "capacitorCost",
  "transportationCost",
  "customerCharge",
  "discount"
] as const;

function initialText(value: unknown) {
  return value == null ? "" : String(value);
}

export function RepairForm({ phase, initial, repairId }: { phase: Phase; initial?: Initial; repairId?: string }) {
  const [pending, startTransition] = useTransition();
  const [photos, setPhotos] = useState<Photo[]>(initial?.photos ?? []);
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initial?.customFields ?? Array.from({ length: 10 }, (_, index) => ({ label: `Custom Field ${index + 1}`, value: "" }))
  );
  const [costs, setCosts] = useState<Costs>({
    copperWireCost: Number(initial?.copperWireCost ?? 0),
    laborCost: Number(initial?.laborCost ?? 0),
    sparePartsCost: Number(initial?.sparePartsCost ?? 0),
    otherCost: Number(initial?.otherCost ?? 0)
    ,
    bearingCost: Number(initial?.bearingCost ?? 0),
    capacitorCost: Number(initial?.capacitorCost ?? 0),
    transportationCost: Number(initial?.transportationCost ?? 0),
    customerCharge: Number(initial?.customerCharge ?? 0),
    discount: Number(initial?.discount ?? 0)
  });
  const total = useMemo(() => costs.copperWireCost + costs.laborCost + costs.bearingCost + costs.capacitorCost + costs.sparePartsCost + costs.transportationCost + costs.otherCost, [costs]);
  const finalAmount = useMemo(() => Math.max(0, costs.customerCharge - costs.discount), [costs]);
  const profit = useMemo(() => costs.customerCharge - total, [costs, total]);

  async function upload(file: File) {
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: data });
    if (!response.ok) {
      alert("Image upload failed.");
      return;
    }
    const photo = await response.json();
    setPhotos((current) => [...current, photo].slice(0, 4));
  }

  function submit(formData: FormData) {
    const inspection = Object.keys(inspectionOptions).reduce<Record<string, string>>((acc, key) => {
      acc[key] = String(formData.get(key) ?? "");
      return acc;
    }, {});
    const payload = {
      phase,
      status: String(formData.get("status") || "OPEN"),
      priority: String(formData.get("priority") || "NORMAL"),
      customerName: String(formData.get("customerName") || ""),
      phoneNumber: String(formData.get("phoneNumber") || ""),
      address: String(formData.get("address") || ""),
      jobNumber: String(formData.get("jobNumber") || ""),
      power: String(formData.get("power") || ""),
      voltage: String(formData.get("voltage") || ""),
      rpm: String(formData.get("rpm") || ""),
      numberOfSlots: String(formData.get("numberOfSlots") || ""),
      startingWireSize: String(formData.get("startingWireSize") || ""),
      runningWireSize: String(formData.get("runningWireSize") || ""),
      wireSize: String(formData.get("wireSize") || ""),
      startingCoilPitch: String(formData.get("startingCoilPitch") || ""),
      runningCoilPitch: String(formData.get("runningCoilPitch") || ""),
      coilPitch: String(formData.get("coilPitch") || ""),
      startingTurns: String(formData.get("startingTurns") || ""),
      runningTurns: String(formData.get("runningTurns") || ""),
      numberOfTurns: String(formData.get("numberOfTurns") || ""),
      motorType: String(formData.get("motorType") || ""),
      manufacturer: String(formData.get("manufacturer") || ""),
      frameSize: String(formData.get("frameSize") || ""),
      mountingType: String(formData.get("mountingType") || ""),
      motorCategory: String(formData.get("motorCategory") || ""),
      inspection,
      customFields,
      additionalNotes: String(formData.get("additionalNotes") || ""),
      repairNotes: String(formData.get("repairNotes") || ""),
      internalNotes: String(formData.get("internalNotes") || ""),
      startDate: String(formData.get("startDate") || ""),
      expectedCompletionDate: String(formData.get("expectedCompletionDate") || ""),
      deliveryDate: String(formData.get("deliveryDate") || ""),
      ...costs,
      paymentStatus: String(formData.get("paymentStatus") || "UNPAID"),
      paymentMethod: String(formData.get("paymentMethod") || "CASH"),
      photos
    };
    startTransition(() => (repairId ? updateRepairAction(repairId, payload) : createRepairAction(payload)));
  }

  return (
    <form action={submit} className="space-y-6">
      <Section title="Customer Information">
        <Field name="customerName" label="Customer Name" initial={initial?.customerName} required />
        <Field name="phoneNumber" label="Phone Number" initial={initial?.phoneNumber} required />
        <Field name="address" label="Address" initial={initial?.address} />
      </Section>

      <Section title="Motor Information">
        <Field name="jobNumber" label="Job Number" initial={initial?.jobNumber} placeholder="Auto-generated if empty" />
        {phase === "OTHER" ? <Field name="motorCategory" label="Motor Category" initial={initial?.motorCategory} /> : null}
        <Field name="power" label="Power" initial={initial?.power} />
        <Field name="voltage" label="Voltage" initial={initial?.voltage} />
        <Field name="rpm" label="RPM" initial={initial?.rpm} />
        <Field name="numberOfSlots" label="Number of Slots" initial={initial?.numberOfSlots} />
        {phase === "SINGLE_PHASE" ? (
          <>
            <Field name="startingWireSize" label="Starting Wire Size" initial={initial?.startingWireSize} />
            <Field name="runningWireSize" label="Running Wire Size" initial={initial?.runningWireSize} />
            <Field name="startingCoilPitch" label="Starting Coil Pitch" initial={initial?.startingCoilPitch} />
            <Field name="runningCoilPitch" label="Running Coil Pitch" initial={initial?.runningCoilPitch} />
            <Field name="startingTurns" label="Starting Number of Turns" initial={initial?.startingTurns} />
            <Field name="runningTurns" label="Running Number of Turns" initial={initial?.runningTurns} />
          </>
        ) : phase === "THREE_PHASE" ? (
          <>
            <Field name="wireSize" label="Wire Size" initial={initial?.wireSize} />
            <Field name="coilPitch" label="Coil Pitch" initial={initial?.coilPitch} />
            <Field name="numberOfTurns" label="Number of Turns" initial={initial?.numberOfTurns} />
          </>
        ) : null}
        <Field name="motorType" label="Motor Type" initial={initial?.motorType} />
        <Field name="manufacturer" label="Manufacturer" initial={initial?.manufacturer} />
        <Field name="frameSize" label="Frame Size" initial={initial?.frameSize} />
        <Field name="mountingType" label="Mounting Type" initial={initial?.mountingType} />
        <div className="space-y-2">
          <Label>Status</Label>
          <Select name="status" defaultValue={String(initial?.status ?? "OPEN")}>
            <option value="OPEN">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
            <option value="TESTING">Testing</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Repair Priority</Label>
          <Select name="priority" defaultValue={String(initial?.priority ?? "NORMAL")}>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>
        <Field name="startDate" label="Start Date" initial={initial?.startDate} type="date" />
        <Field name="expectedCompletionDate" label="Expected Completion Date" initial={initial?.expectedCompletionDate} type="date" />
        <Field name="deliveryDate" label="Delivery Date" initial={initial?.deliveryDate} type="date" />
      </Section>

      {phase === "OTHER" ? (
        <Section title="Custom Data">
          {customFields.map((field, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-2">
              <Input value={field.label} onChange={(event) => setCustomFields((items) => items.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} />
              <Input value={field.value} onChange={(event) => setCustomFields((items) => items.map((item, i) => i === index ? { ...item, value: event.target.value } : item))} />
            </div>
          ))}
        </Section>
      ) : null}

      <Section title="Inspection">
        {Object.entries(inspectionOptions).map(([key, options]) => (
          <div className="space-y-2" key={key}>
            <Label>{labels[key]}</Label>
            <Select name={key} defaultValue={String(initial?.inspection?.[key] ?? options[0])}>
              {options.map((option) => <option key={option}>{option}</option>)}
            </Select>
          </div>
        ))}
      </Section>

      <Section title="Photos">
        <div className="col-span-full grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Motor Photo 1", "Motor Photo 2", "Motor Photo 3", "Additional Photo"].map((label, index) => (
            <label key={label} className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border bg-background p-3 text-center text-sm text-muted-foreground">
              {photos[index] ? <Image src={photos[index].url} alt={label} width={240} height={160} className="mb-2 h-28 w-full rounded object-cover" /> : <UploadCloud className="mb-2 h-6 w-6" />}
              {label}
              <input className="hidden" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0])} />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Costs">
        {costKeys.map((key) => (
          <div className="space-y-2" key={key}>
            <Label>{key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}</Label>
            <Input type="number" min="0" step="0.01" value={costs[key]} onChange={(event) => setCosts((current) => ({ ...current, [key]: Number(event.target.value) }))} />
          </div>
        ))}
        <div className="business-card card-orange rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-semibold">{total.toFixed(2)}</p>
        </div>
        <div className="business-card card-emerald rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Final Amount</p>
          <p className="text-2xl font-semibold">{finalAmount.toFixed(2)}</p>
        </div>
        <div className="business-card card-teal rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Profit</p>
          <p className="text-2xl font-semibold">{profit.toFixed(2)}</p>
          <StatusBadge type="profit" value={`${profit.toFixed(0)} Birr`} amount={profit} className="mt-3" />
        </div>
        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select name="paymentStatus" defaultValue={String(initial?.paymentStatus ?? "UNPAID")}>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select name="paymentMethod" defaultValue={String(initial?.paymentMethod ?? "CASH")}>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MOBILE_PAYMENT">Mobile Payment</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
      </Section>

      <div className="space-y-2">
        <Label>Additional Notes</Label>
        <Textarea name="additionalNotes" defaultValue={initialText(initial?.additionalNotes)} />
      </div>
      <div className="space-y-2">
        <Label>Repair Notes</Label>
        <Textarea name="repairNotes" defaultValue={initialText(initial?.repairNotes)} />
      </div>
      <div className="space-y-2">
        <Label>Internal Notes (Owner Only)</Label>
        <Textarea name="internalNotes" defaultValue={initialText(initial?.internalNotes)} />
      </div>

      <Button disabled={pending} className="w-full sm:w-auto"><Save className="h-4 w-4" /> {pending ? "Saving" : "Save Repair Record"}</Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="business-card rounded-lg border p-5">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({ name, label, initial, placeholder, required, type = "text" }: { name: string; label: string; initial?: unknown; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} name={name} defaultValue={initial == null ? "" : String(initial)} placeholder={placeholder} required={required} />
    </div>
  );
}
