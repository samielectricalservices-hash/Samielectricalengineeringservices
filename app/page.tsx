import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Sami Electrical Engineering Services</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Motor Service Management System</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Use the login page to access the company workspace.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
