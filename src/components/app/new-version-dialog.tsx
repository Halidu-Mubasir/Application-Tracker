"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDocumentVersion } from "@/lib/actions/documents";
import { Plus } from "lucide-react";

export function NewVersionDialog({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-3.5" /> New version
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new version</DialogTitle>
        </DialogHeader>
        <form action={addDocumentVersion.bind(null, documentId)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="label">Version label</Label>
            <Input id="label" name="label" placeholder="e.g. tailored for Stanford" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" required />
          </div>
          <Button type="submit" className="w-full">
            Upload
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
