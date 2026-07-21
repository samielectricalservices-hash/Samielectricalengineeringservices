import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { BusinessService } from "@/services/business-service";

export const dynamic = "force-dynamic";

type MotorRepair = {
  id: string;
  reference: string;
  status: string;
  wireSize?: string | null;
  startingWireSize?: string | null;
  numberOfTurns?: string | null;
  startingTurns?: string | null;
  inspection?: Record<string, unknown> | null;
  cost?: { totalCost?: unknown } | null;
};

type MotorDetail = {
  id: string;
  serialNumber: string;
  phase: string;
  motorType?: string | null;
  customer: { name: string };
  repairs: MotorRepair[];
};

export default async function MotorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const motor = await BusinessService.motor(id) as unknown as MotorDetail | null;
  if (!motor) notFound();
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">{motor.serialNumber}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{motor.customer.name} - {motor.motorType ?? motor.phase}</p>
      </div>
      <section className="business-card rounded-lg border p-5">
        <h2 className="mb-4 text-base font-semibold">Complete Repair History</h2>
        {motor.repairs.length === 0 ? <p className="text-sm text-muted-foreground">No motor history.</p> : motor.repairs.map((repair) => (
          <Link href={`/repairs/${repair.id}`} key={repair.id} className="block border-b py-4 last:border-0">
            <p className="font-medium">{repair.reference} - {repair.status.replaceAll("_", " ")}</p>
            <p className="text-sm text-muted-foreground">Winding: {repair.wireSize ?? repair.startingWireSize ?? "-"} / Turns: {repair.numberOfTurns ?? repair.startingTurns ?? "-"}</p>
            <p className="text-sm text-muted-foreground">Cost: {Number(repair.cost?.totalCost ?? 0).toFixed(2)} - Test: {String(repair.inspection?.finalTestResult ?? "-")}</p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
