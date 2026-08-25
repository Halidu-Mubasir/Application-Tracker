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
import { linkContactToApplication } from "@/lib/actions/applications";

export function AddContactForm({
  applicationId,
  contacts,
}: {
  applicationId: string;
  contacts: { id: string; name: string; university: string | null }[];
}) {
  const [contactId, setContactId] = useState("");

  return (
    <form
      action={linkContactToApplication.bind(null, applicationId)}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="contactId" value={contactId} required />
      <Select value={contactId} onValueChange={setContactId}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Choose a contact" />
        </SelectTrigger>
        <SelectContent>
          {contacts.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
              {c.university ? ` (${c.university})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input name="role" placeholder="Role (POI, cold-emailed…)" className="w-48" />
      <Button type="submit" size="sm" variant="secondary">
        Link contact
      </Button>
    </form>
  );
}
