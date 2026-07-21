"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

type Result = { id: string; reference: string; status: string; phase: string; power?: string; voltage?: string; rpm?: string; customer: { name: string; phone?: string }; motor: { motorType?: string }; cost?: { totalCost: string } };
type QueryState = {
  q: string;
  customerName: string;
  phoneNumber: string;
  jobNumber: string;
  motorType: string;
  power: string;
  voltage: string;
  rpm: string;
  phase: string;
  date: string;
  status: string;
  sort: string;
  page: string;
};
const filterNames = ["customerName", "phoneNumber", "jobNumber", "motorType", "power", "voltage", "rpm"] as const;

function rowTone(status: string) {
  if (status === "COMPLETED" || status === "DELIVERED") return "row-completed";
  if (status === "OPEN" || status === "WAITING_FOR_PARTS") return "row-pending";
  if (status === "CANCELLED") return "row-urgent";
  return "";
}

export function SearchClient() {
  const [query, setQuery] = useState<QueryState>({ q: "", customerName: "", phoneNumber: "", jobNumber: "", motorType: "", power: "", voltage: "", rpm: "", phase: "", date: "", status: "", sort: "newest", page: "1" });
  const [result, setResult] = useState<{ items: Result[]; total: number; totalPages: number; page: number }>({ items: [], total: 0, totalPages: 1, page: 1 });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        const params = new URLSearchParams(query);
        const response = await fetch(`/api/search?${params.toString()}`);
        setResult(await response.json());
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function set(name: string, value: string) {
    setQuery((current) => ({ ...current, [name]: value, page: name === "page" ? value : "1" }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Search System</h1>
        <p className="mt-2 text-sm text-muted-foreground">Search by customer, phone, job number, motor values, date, phase, and status.</p>
      </div>
      <div className="business-card rounded-lg border p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={query.q} onChange={(e) => set("q", e.target.value)} placeholder="Live search all repair records..." className="pl-9" />
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {filterNames.map((name) => (
            <Input key={name} value={query[name]} onChange={(e) => set(name, e.target.value)} placeholder={name.replace(/([A-Z])/g, " $1")} />
          ))}
          <Input type="date" value={query.date} onChange={(e) => set("date", e.target.value)} />
          <Select value={query.phase} onChange={(e) => set("phase", e.target.value)}>
            <option value="">All Phases</option><option value="SINGLE_PHASE">Single Phase</option><option value="THREE_PHASE">Three Phase</option><option value="OTHER">Other</option>
          </Select>
          <Select value={query.status} onChange={(e) => set("status", e.target.value)}>
            <option value="">All Statuses</option><option value="OPEN">Pending</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
          </Select>
          <Select value={query.sort} onChange={(e) => set("sort", e.target.value)}>
            <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="customer">Customer</option><option value="status">Status</option>
          </Select>
        </div>
      </div>

      <div className="business-card overflow-hidden rounded-lg border">
        <div className="border-b p-4 text-sm text-muted-foreground">{pending ? "Searching..." : `${result.total} result(s)`}</div>
        {result.items.length === 0 ? (
          <div className="empty-state p-10 text-center text-sm">No repair records match the current filters.</div>
        ) : result.items.map((item) => (
          <Link href={`/repairs/${item.id}`} key={item.id} className={`grid gap-3 border-b p-4 transition hover:bg-secondary/60 lg:grid-cols-[1fr_120px_120px_120px] ${rowTone(item.status)}`}>
            <div><p className="font-medium">{item.customer.name}</p><p className="text-sm text-muted-foreground">{item.reference} - {item.customer.phone ?? "No phone"}</p></div>
            <p className="text-sm">{item.motor.motorType ?? item.phase.replace("_", " ")}</p>
            <p className="text-sm text-muted-foreground">{item.power || "-"} / {item.voltage || "-"}</p>
            <StatusBadge value={item.status} />
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled={Number(query.page) <= 1} onClick={() => set("page", String(Number(query.page) - 1))}>Previous</Button>
        <p className="text-sm text-muted-foreground">Page {result.page} of {result.totalPages}</p>
        <Button variant="ghost" disabled={Number(query.page) >= result.totalPages} onClick={() => set("page", String(Number(query.page) + 1))}>Next</Button>
      </div>
    </div>
  );
}
