"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { linkDocumentVersionToApplication } from "@/lib/actions/documents";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";
import type { DocumentType } from "@prisma/client";

export function AddDocumentForm({
  applicationId,
  versions,
}: {
  applicationId: string;
  versions: {
    id: string;
    label: string | null;
    versionNumber: number;
    document: { title: string; type: DocumentType };
  }[];
}) {
  const [versionId, setVersionId] = useState("");

  return (
    <form
      action={linkDocumentVersionToApplication.bind(null, applicationId)}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="documentVersionId" value={versionId} required />
      <Select value={versionId} onValueChange={setVersionId}>
        <SelectTrigger className="w-72">
          <SelectValue placeholder="Choose a document version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.document.title} · v{v.versionNumber}
              {v.label ? ` (${v.label})` : ""} — {DOCUMENT_TYPE_LABEL[v.document.type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input name="roleNote" placeholder="e.g. primary SOP" className="w-40" />
      <Button type="submit" size="sm" variant="secondary">
        Link document
      </Button>
    </form>
  );
}
