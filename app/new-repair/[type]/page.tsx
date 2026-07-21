import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RepairForm } from "@/features/repairs/components/repair-form";

const map = {
  "single-phase": { phase: "SINGLE_PHASE", title: "Single Phase Motor Form" },
  "three-phase": { phase: "THREE_PHASE", title: "Three Phase Motor Form" },
  other: { phase: "OTHER", title: "Other Motor Form" }
} as const;

export default async function TypedRepairPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const config = map[type as keyof typeof map];
  if (!config) notFound();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">{config.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Record customer, motor, inspection, photos, and cost information.</p>
      </div>
      <RepairForm phase={config.phase} />
    </AppShell>
  );
}
