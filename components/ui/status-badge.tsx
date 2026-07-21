import { AlertTriangle, CheckCircle2, Clock3, CircleDollarSign, PauseCircle, Wrench, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

type StatusBadgeProps = {
  value: string;
  type?: "repair" | "payment" | "priority" | "profit";
  amount?: number;
  className?: string;
};

function humanize(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function profitTone(amount = 0) {
  if (amount < 0) return "soft-red";
  if (amount <= 5000) return "soft-orange";
  if (amount <= 20000) return "soft-amber";
  return "soft-emerald";
}

function toneFor(value: string, type: StatusBadgeProps["type"], amount?: number) {
  const normalized = value.toUpperCase();
  if (type === "profit") return profitTone(amount);
  if (type === "payment") {
    if (normalized === "PAID") return "soft-emerald";
    if (normalized === "PARTIAL" || normalized === "PARTIALLY_PAID") return "soft-amber";
    if (normalized === "REFUNDED") return "soft-purple";
    return "soft-red";
  }
  if (type === "priority") {
    if (normalized === "LOW") return "soft-gray";
    if (normalized === "NORMAL" || normalized === "MEDIUM") return "soft-blue";
    if (normalized === "HIGH") return "soft-orange";
    return "soft-red";
  }
  if (normalized === "COMPLETED" || normalized === "DELIVERED") return "soft-emerald";
  if (normalized === "IN_PROGRESS" || normalized === "TESTING") return "soft-blue";
  if (normalized === "WAITING_FOR_PARTS") return "soft-orange";
  if (normalized === "WAITING_FOR_CUSTOMER" || normalized === "OPEN") return "soft-amber";
  if (normalized === "CANCELLED") return "soft-gray";
  if (normalized === "URGENT") return "soft-red";
  return "soft-blue";
}

function iconFor(value: string, type: StatusBadgeProps["type"]) {
  const normalized = value.toUpperCase();
  if (type === "payment" || type === "profit") return CircleDollarSign;
  if (normalized === "COMPLETED" || normalized === "DELIVERED" || normalized === "PAID") return CheckCircle2;
  if (normalized.includes("WAITING") || normalized === "OPEN" || normalized === "PARTIAL") return Clock3;
  if (normalized === "CANCELLED") return XCircle;
  if (normalized === "HIGH" || normalized === "URGENT" || normalized === "CRITICAL") return AlertTriangle;
  if (normalized === "LOW") return PauseCircle;
  return Wrench;
}

export function StatusBadge({ value, type = "repair", amount, className }: StatusBadgeProps) {
  const Icon = iconFor(value, type);
  const tone = toneFor(value, type, amount);

  return (
    <span className={cn("status-badge", tone, className)}>
      <Icon className="h-3.5 w-3.5" />
      {type === "profit" ? value : humanize(value)}
    </span>
  );
}
