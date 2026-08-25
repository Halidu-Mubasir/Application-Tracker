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
import { addRecommenderToApplication } from "@/lib/actions/recommenders";

export function AddRecommenderForm({
  applicationId,
  contacts,
}: {
  applicationId: string;
  contacts: { id: string; name: string }[];
}) {
  const [contactId, setContactId] = useState("");

  return (
    <form
      action={addRecommenderToApplication.bind(null, applicationId)}
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
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input name="relationship" placeholder="PhD advisor…" className="w-48" />
      <Button type="submit" size="sm" variant="secondary">
        Add recommender
      </Button>
    </form>
  );
}
