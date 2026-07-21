import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { BusinessService } from "@/services/business-service";

export const dynamic = "force-dynamic";

type CustomerRepair = {
  id: string;
  reference: string;
  status: string;
  phase: string;
  createdAt: Date;
  motor: { motorType?: string | null };
  cost?: { finalAmount?: unknown } | null;
};

type CustomerDetail = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  repairs: CustomerRepair[];
};

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await BusinessService.customer(id) as unknown as CustomerDetail | null;
  if (!customer) notFound();
  const totalSpent = customer.repairs.reduce((sum, repair) => sum + Number(repair.cost?.finalAmount ?? 0), 0);
  const current = customer.repairs.filter((repair) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(repair.status));
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">{customer.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{customer.phone ?? "No phone"} - {customer.address ?? "No address"}</p>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card label="Total Money Spent" value={totalSpent.toFixed(2)} />
        <Card label="Number of Repairs" value={customer.repairs.length} />
        <Card label="Current Repairs" value={current.length} />
        <Card label="Last Visit" value={customer.repairs[0] ? new Date(customer.repairs[0].createdAt).toLocaleDateString() : "-"} />
      </div>
      <section className="business-card rounded-lg border p-5">
        <h2 className="mb-4 text-base font-semibold">All Previous Repairs</h2>
        <div className="space-y-3">
          {customer.repairs.length === 0 ? <p className="text-sm text-muted-foreground">No repair history.</p> : customer.repairs.map((repair) => (
            <Link href={`/repairs/${repair.id}`} key={repair.id} className="grid rounded-md border p-3 hover:bg-secondary/60 md:grid-cols-[1fr_140px_120px]">
              <span>{repair.reference} - {repair.motor.motorType ?? repair.phase}</span>
              <span>{repair.status.replaceAll("_", " ")}</span>
              <span>{Number(repair.cost?.finalAmount ?? 0).toFixed(2)}</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return <div className="business-card rounded-lg border p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
