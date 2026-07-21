import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { BusinessService } from "@/services/business-service";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await BusinessService.customers();
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Customer History</h1>
        <p className="mt-2 text-sm text-muted-foreground">Profiles, total spending, repair counts, and last visits.</p>
      </div>
      <div className="business-card overflow-hidden rounded-lg border">
        {customers.length === 0 ? <div className="empty-state p-10 text-center text-sm">No customers recorded yet.</div> : customers.map((customer) => (
          <Link href={`/customers/${customer.id}`} key={customer.id} className="grid gap-3 border-b p-4 transition hover:bg-secondary/60 md:grid-cols-[1fr_140px_160px_160px]">
            <div><p className="font-medium">{customer.name}</p><p className="text-sm text-muted-foreground">{customer.phone ?? "No phone"}</p></div>
            <p className="text-sm">{customer.repairCount} repairs</p>
            <p className="text-sm font-medium">{customer.totalSpent.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{new Date(customer.lastVisit).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
