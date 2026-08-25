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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDocumentWithVersion } from "@/lib/actions/documents";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABEL } from "@/lib/constants";
import { Plus } from "lucide-react";

export function NewDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof DOCUMENT_TYPES)[number]>("SOP");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Upload document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
        </DialogHeader>
        <form action={createDocumentWithVersion} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Statement of Purpose" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <input type="hidden" name="type" value={type} />
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {DOCUMENT_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="label">Version label</Label>
            <Input id="label" name="label" placeholder="e.g. base draft" />
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
