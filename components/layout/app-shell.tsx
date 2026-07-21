import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, PlusCircle, Search, Users, FileText, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { CompanyLogo } from "@/components/brand/company-logo";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/session";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/new-repair", label: "New Repair", icon: PlusCircle },
  { href: "/search", label: "Search Motors", icon: Search },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/search?view=settings", label: "Settings", icon: Settings }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-card/90 text-[hsl(var(--sidebar-foreground))] shadow-[18px_0_55px_hsl(222_40%_12%/0.06)] backdrop-blur-xl lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <CompanyLogo size="sm" />
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[hsl(var(--sidebar-muted))] transition hover:bg-secondary hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="absolute bottom-4 left-3 right-3">
          <Button variant="ghost" className="w-full justify-start text-[hsl(var(--sidebar-muted))] hover:bg-secondary hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card/90 px-5 backdrop-blur">
          <div>
            <p className="text-sm font-medium">Motor Service Management System</p>
            <p className="text-xs text-muted-foreground">{session.user.name ?? session.user.email}</p>
          </div>
          <Link href="/new-repair">
            <Button><PlusCircle className="h-4 w-4" /> New Data</Button>
          </Link>
        </header>
        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
