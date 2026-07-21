import { Gauge } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden border-r bg-secondary/40 lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:56px_56px] opacity-45" />
        <div className="absolute left-12 top-12 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Gauge className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-normal">SAMI ELECTRICAL ENGINEERING SERVICES DATA BASE </span>
        </div>
        <div className="relative flex min-h-screen items-end p-12">
          <div className="max-w-xl pb-10">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Motor Service Management System
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground">
              Secure access for service operations.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Enterprise authentication, auditability, and PostgreSQL-backed foundations
              for the SAMI ELECTRICAL ENGINEERING SERVICES workspace.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Gauge className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">S</span>
          </div>

          <div className="mb-8">
            <div className="mb-5 hidden h-10 w-10 items-center justify-center rounded-md border bg-card shadow-sm lg:flex">
              <Gauge className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-normal">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Login with your company email and password.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
