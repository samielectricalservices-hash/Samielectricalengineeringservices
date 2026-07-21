import Link from "next/link";
import { Clock, CheckCircle2, Gauge, PlusCircle, Search, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { markNotificationsReadAction } from "@/actions/notification-actions";
import { RepairService } from "@/services/repair-service";
import { getCurrentSession } from "@/lib/session";
import { BusinessService } from "@/services/business-service";
import { NotificationService } from "@/services/notification-service";
import { BusinessCharts } from "@/features/business/components/business-charts";

export const dynamic = "force-dynamic";

type DashboardRepair = {
  id: string;
  reference: string;
  status: string;
  phase: string;
  customer: { name: string };
  motor: { motorType?: string | null };
  cost?: { totalCost?: unknown } | null;
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const data = await RepairService.dashboard();
  const business = await BusinessService.summary();
  const charts = await BusinessService.chartData();
  const notifications = session?.user ? await NotificationService.recent(session.user.id) : [];
  const unreadNotifications = session?.user ? await NotificationService.unreadCount(session.user.id) : 0;

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, {session?.user?.name ?? "Employee"}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Dashboard</h1>
          </div>
          <div className="flex w-full gap-2 lg:w-[520px]">
            <form action="/search" className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input name="q" placeholder="Search customer, phone, job number..." className="pl-9" />
            </form>
            <Link href="/new-repair"><Button><PlusCircle className="h-4 w-4" /> New Data</Button></Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={Gauge} label="Total Motors" value={data.totalMotors} tone="card-indigo" />
          <Stat icon={Clock} label="Today's Repairs" value={data.repairsToday} tone="card-blue" />
          <Stat icon={Wrench} label="Pending Repairs" value={data.pendingRepairs} tone="card-amber" />
          <Stat icon={CheckCircle2} label="Completed Repairs" value={data.completedRepairs} tone="card-emerald" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(business).map(([label, value], index) => (
            <div key={label} className={`business-card rounded-lg border p-5 ${["card-blue", "card-teal", "card-purple", "card-indigo"][index]}`}>
              <p className="text-sm font-medium capitalize">{label}</p>
              <p className="mt-3 text-sm text-muted-foreground">Repairs: {value.repairs}</p>
              <p className="text-sm text-muted-foreground">Income: {value.income.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Expenses: {value.expenses.toFixed(2)}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">Profit: {value.profit.toFixed(2)}</p>
                <StatusBadge type="profit" value={`${value.profit.toFixed(0)} Birr`} amount={value.profit} />
              </div>
            </div>
          ))}
        </div>

        <section className="business-card rounded-lg border p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">{unreadNotifications} unread updates</p>
            </div>
            {unreadNotifications > 0 ? (
              <form action={markNotificationsReadAction}>
                <Button variant="ghost" className="h-9 border px-3">Mark all read</Button>
              </form>
            ) : null}
          </div>
          {notifications.length === 0 ? <p className="text-sm text-muted-foreground">No notifications yet.</p> : notifications.map((item) => (
            <div key={item.id} className="flex gap-3 border-b py-3 last:border-0">
              <span className={`mt-1 h-2 w-2 rounded-full ${item.status === "UNREAD" ? "status-dot bg-accent" : "bg-border"}`} />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.message}</p>
              </div>
            </div>
          ))}
        </section>

        <BusinessCharts months={charts.months} status={charts.status} motorTypes={charts.motorTypes} topCustomers={charts.topCustomers} />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently Added Motors</h2>
            <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          <div className="business-card overflow-hidden rounded-lg border">
            {data.recent.length === 0 ? (
              <div className="empty-state p-10 text-center text-sm">No motor repair records yet. Create your first record from New Data.</div>
            ) : (
              (data.recent as unknown as DashboardRepair[]).map((repair) => (
                <Link href={`/repairs/${repair.id}`} key={repair.id} className={`grid gap-3 border-b p-4 transition hover:bg-secondary/60 md:grid-cols-[1fr_140px_140px] ${rowTone(repair.status)}`}>
                  <div>
                    <p className="font-medium">{repair.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{repair.reference} - {repair.motor.motorType ?? repair.phase.replace("_", " ")}</p>
                  </div>
                  <StatusBadge value={repair.status} />
                  <p className="text-sm font-medium">{Number(repair.cost?.totalCost ?? 0).toFixed(2)}</p>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function rowTone(status: string) {
  if (status === "COMPLETED" || status === "DELIVERED") return "row-completed";
  if (status === "OPEN" || status === "WAITING_FOR_PARTS") return "row-pending";
  if (status === "CANCELLED") return "row-urgent";
  return "";
}

function Stat({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: string }) {
  return (
    <div className={`business-card rounded-lg border p-5 ${tone}`}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent"><Icon className="h-5 w-5" /></div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
