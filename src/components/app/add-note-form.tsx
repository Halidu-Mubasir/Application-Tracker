"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNoteToApplication } from "@/lib/actions/applications";

export function AddNoteForm({ applicationId }: { applicationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addNoteToApplication(applicationId, formData);
          formRef.current?.reset();
        });
      }}
      className="flex flex-col gap-2"
    >
      <Textarea name="note" placeholder="Log a note…" rows={2} required />
      <Button type="submit" size="sm" className="self-start" disabled={pending}>
        {pending ? "Adding…" : "Add note"}
      </Button>
    </form>
  );
}
