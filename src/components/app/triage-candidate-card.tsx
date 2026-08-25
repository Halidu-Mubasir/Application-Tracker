"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { triageThread } from "@/lib/actions/gmail-triage";
import type { TriageCandidateThread } from "@/lib/gmail";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

type Target = "application" | "contact" | "new-contact" | "skip";

export function TriageCandidateCard({
  candidate,
  applications,
  contacts,
}: {
  candidate: TriageCandidateThread;
  applications: { id: string; school: string; program: string }[];
  contacts: { id: string; name: string }[];
}) {
  const [target, setTarget] = useState<Target>("skip");
  const [applicationId, setApplicationId] = useState("");
  const [contactId, setContactId] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const { representative, messageCount } = candidate;

  if (done) return null;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <p className="font-medium">{representative.subject || "(no subject)"}</p>
          <p className="shrink-0 text-xs text-muted-foreground">
            {format(representative.internalDate, "PPP")}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          From {representative.from}
          {messageCount > 1 ? ` · ${messageCount} messages in thread` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {representative.snippet}
        </p>
        <form
          action={(formData) => {
            startTransition(async () => {
              await triageThread(formData);
              toast.success("Triaged");
              setDone(true);
            });
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="threadId" value={candidate.threadId} />
          <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip / just archive</SelectItem>
              <SelectItem value="application">Link to application</SelectItem>
              <SelectItem value="contact">Link to contact</SelectItem>
              <SelectItem value="new-contact">Create new contact</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="target" value={target} />

          {target === "application" && (
            <>
              <input type="hidden" name="applicationId" value={applicationId} required />
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose an application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.school} — {a.program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {target === "contact" && (
            <>
              <input type="hidden" name="contactId" value={contactId} required />
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger className="w-64">
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
            </>
          )}

          {target === "new-contact" && (
            <>
              <Input
                name="newContactName"
                placeholder="Name"
                required
                className="w-40"
              />
              <Input
                name="newContactUniversity"
                placeholder="University (optional)"
                className="w-48"
              />
            </>
          )}

          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
