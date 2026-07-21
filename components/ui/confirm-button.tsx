"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this repair record? This action will archive it from active results.")) {
          startTransition(() => action());
        }
      }}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting" : "Delete"}
    </Button>
  );
}
