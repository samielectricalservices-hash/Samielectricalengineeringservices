import Link from "next/link";
import { Zap, Cable, Blocks } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const cards = [
  { href: "/new-repair/single-phase", title: "Single Phase Motor", desc: "Start/run winding data, capacitor inspection, costs, photos.", icon: Zap },
  { href: "/new-repair/three-phase", title: "Three Phase Motor", desc: "Coil pitch, wire size, turns, inspection, costs, photos.", icon: Cable },
  { href: "/new-repair/other", title: "Other", desc: "Custom category with ten label/value fields.", icon: Blocks }
];

export default function NewRepairPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">New Data</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose the motor category to open the right repair record form.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <Link href={card.href} key={card.href} className="business-card rounded-lg border p-6 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-accent/10 text-accent"><card.icon className="h-6 w-6" /></div>
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.desc}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
