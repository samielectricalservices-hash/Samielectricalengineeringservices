import { AppShell } from "@/components/layout/app-shell";
import { SearchClient } from "@/features/repairs/components/search-client";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <AppShell>
      <SearchClient />
    </AppShell>
  );
}
