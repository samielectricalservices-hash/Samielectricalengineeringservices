import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { BusinessService } from "@/services/business-service";

export const dynamic = "force-dynamic";

const reports = ["Daily Report", "Weekly Report", "Monthly Report", "Annual Report", "Customer Report", "Repair Report", "Financial Report", "Motor History Report"];
const money = new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function ReportsPage() {
  const summary = await BusinessService.summary();
  const charts = await BusinessService.chartData();
  const overview = await BusinessService.reportOverview();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">Operational and financial reporting for repair performance.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(summary).map(([period, value]) => (
          <section key={period} className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium capitalize">{period}</p>
            <p className="mt-3 text-3xl font-semibold">{value.repairs}</p>
            <p className="text-sm text-muted-foreground">Repairs</p>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Income</span><span>{money.format(value.income)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span>{money.format(value.expenses)}</span></div>
              <div className="flex justify-between font-medium"><span>Profit</span><span>{money.format(value.profit)}</span></div>
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <section key={report} className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">{report}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Repairs, income, expenses, profit, and operational summary.</p>
            <Link href={`/api/pdf/report?type=${encodeURIComponent(report)}`} className="mt-4 inline-block text-sm font-medium">Export PDF</Link>
          </section>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Breakdown title="Payment Status" rows={overview.paymentStatus} />
        <Breakdown title="Repair Priority" rows={overview.priority} />
        <Breakdown title="Repairs By Status" rows={charts.status} />
        <Breakdown title="Repairs By Motor Type" rows={charts.motorTypes} />
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">Recent Repair Financials</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest records with revenue and profit visibility.</p>
        </div>
        {overview.recent.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No repair records available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-secondary/60 text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Job</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Motor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Final Amount</th>
                  <th className="px-5 py-3 text-right font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {overview.recent.map((repair) => (
                  <tr key={repair.id} className="border-t">
                    <td className="px-5 py-3 font-medium"><Link href={`/repairs/${repair.id}`}>{repair.reference}</Link></td>
                    <td className="px-5 py-3">{repair.customer}</td>
                    <td className="px-5 py-3">{label(repair.motorType)}</td>
                    <td className="px-5 py-3">{label(repair.status)}</td>
                    <td className="px-5 py-3 text-right">{money.format(repair.finalAmount)}</td>
                    <td className="px-5 py-3 text-right font-medium">{money.format(repair.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available.</p>
        ) : rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{label(row.label)}</span>
              <span className="font-medium">{row.value}</span>
            </div>
            <div className="h-2 rounded bg-secondary">
              <div className="h-2 rounded bg-primary" style={{ width: `${Math.max(4, row.value / max * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
