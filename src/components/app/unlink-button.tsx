"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function UnlinkButton({ action }: { action: () => Promise<unknown> }) {
  async function handleAction() {
    await action();
  }

  return (
    <form action={handleAction}>
      <Button type="submit" size="icon-xs" variant="ghost">
        <X className="size-3.5" />
      </Button>
    </form>
  );
}
