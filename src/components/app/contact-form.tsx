"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Contact } from "@prisma/client";

export function ContactForm({
  contact,
  action,
}: {
  contact?: Contact;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={contact?.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="university">University</Label>
          <Input id="university" name="university" defaultValue={contact?.university ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue={contact?.department ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="researchTags">Research tags</Label>
          <Input
            id="researchTags"
            name="researchTags"
            placeholder="comma, separated, tags"
            defaultValue={contact?.researchTags.join(", ") ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="personalSite">Personal site</Label>
          <Input id="personalSite" name="personalSite" defaultValue={contact?.personalSite ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scholarUrl">Google Scholar</Label>
          <Input id="scholarUrl" name="scholarUrl" defaultValue={contact?.scholarUrl ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="orcid">ORCID</Label>
          <Input id="orcid" name="orcid" defaultValue={contact?.orcid ?? ""} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="notes">Notes (relevant work, conversation history…)</Label>
          <Textarea id="notes" name="notes" defaultValue={contact?.notes ?? ""} rows={5} />
        </div>
      </div>
      <Button type="submit">{contact ? "Save changes" : "Create contact"}</Button>
    </form>
  );
}
