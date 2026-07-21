"use client";

type Month = { label: string; income: number; expenses: number; profit: number; repairs: number };
type Slice = { label: string; value: number };

export function BusinessCharts({ months, status, motorTypes, topCustomers }: { months: Month[]; status: Slice[]; motorTypes: Slice[]; topCustomers: Array<{ name: string; total: number; repairs: number }> }) {
  const palette = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <BarChart title="Monthly Profit" color="hsl(174 46% 31%)" data={months.map((m) => ({ label: m.label, value: m.profit }))} smartProfit />
      <BarChart title="Monthly Income" color="hsl(151 39% 34%)" data={months.map((m) => ({ label: m.label, value: m.income }))} />
      <BarChart title="Monthly Expenses" color="hsl(24 56% 46%)" data={months.map((m) => ({ label: m.label, value: m.expenses }))} />
      <BarChart title="Repairs Per Month" color={palette[2]} data={months.map((m) => ({ label: m.label, value: m.repairs }))} />
      <ListChart title="Repairs By Status" data={status} colorFor={statusColor} />
      <ListChart title="Repairs By Motor Type" data={motorTypes} colorFor={(_, index) => palette[index % palette.length]} />
      <ListChart title="Top Customers" color="hsl(266 32% 48%)" data={topCustomers.map((c) => ({ label: `${c.name} (${c.repairs})`, value: c.total }))} />
      <ListChart title="Most Common Motor Type" data={[...motorTypes].sort((a, b) => b.value - a.value).slice(0, 6)} colorFor={(_, index) => palette[index % palette.length]} />
    </div>
  );
}

function profitColor(value: number) {
  if (value < 0) return "hsl(358 46% 48%)";
  if (value <= 5000) return "hsl(24 56% 46%)";
  if (value <= 20000) return "hsl(40 60% 46%)";
  return "hsl(151 39% 34%)";
}

function statusColor(label: string) {
  const normalized = label.toUpperCase();
  if (normalized === "COMPLETED" || normalized === "DELIVERED") return "hsl(151 39% 34%)";
  if (normalized === "IN_PROGRESS" || normalized === "TESTING") return "hsl(208 45% 42%)";
  if (normalized === "WAITING_FOR_PARTS") return "hsl(24 56% 46%)";
  if (normalized === "OPEN" || normalized === "WAITING_FOR_CUSTOMER") return "hsl(40 60% 46%)";
  if (normalized === "CANCELLED") return "hsl(220 10% 48%)";
  return "hsl(219 50% 24%)";
}

function BarChart({ title, data, color, smartProfit = false }: { title: string; color: string; smartProfit?: boolean; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...data.map((item) => Math.abs(item.value)));
  return (
    <section className="business-card rounded-lg border p-5">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <div className="flex h-56 items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end rounded bg-secondary">
              <div className="w-full rounded" style={{ backgroundColor: smartProfit ? profitColor(item.value) : color, height: `${Math.max(3, Math.abs(item.value) / max * 100)}%` }} title={`${item.label}: ${item.value.toFixed(2)}`} />
            </div>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListChart({ title, data, color, colorFor }: { title: string; color?: string; colorFor?: (label: string, index: number) => string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <section className="business-card rounded-lg border p-5">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <div className="space-y-3">
        {data.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : data.map((item, index) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><span>{item.value.toFixed(item.value % 1 ? 2 : 0)}</span></div>
            <div className="h-2 rounded bg-secondary"><div className="h-2 rounded" style={{ backgroundColor: colorFor ? colorFor(item.label, index) : color, width: `${Math.max(4, item.value / max * 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
