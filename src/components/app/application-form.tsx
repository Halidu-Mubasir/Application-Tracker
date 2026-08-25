"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUSES, STATUS_LABEL } from "@/lib/constants";
import type { Application } from "@prisma/client";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ApplicationForm({
  application,
  action,
}: {
  application?: Application;
  action: (formData: FormData) => void;
}) {
  const [status, setStatus] = useState(application?.status ?? "RESEARCHING");

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="school">School</Label>
          <Input id="school" name="school" defaultValue={application?.school} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program">Program</Label>
          <Input id="program" name="program" defaultValue={application?.program} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <Input id="department" name="department" defaultValue={application?.department ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="degreeType">Degree type</Label>
          <Input
            id="degreeType"
            name="degreeType"
            placeholder="PhD, MA, MS…"
            defaultValue={application?.degreeType}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="term">Term</Label>
          <Input
            id="term"
            name="term"
            placeholder="Fall 2027"
            defaultValue={application?.term}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <input type="hidden" name="status" value={status} />
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={toDateInputValue(application?.deadline)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="decisionDate">Decision date</Label>
          <Input
            id="decisionDate"
            name="decisionDate"
            type="date"
            defaultValue={toDateInputValue(application?.decisionDate)}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="portalUrl">Portal URL</Label>
          <Input id="portalUrl" name="portalUrl" defaultValue={application?.portalUrl ?? ""} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="fundingInfo">Funding info</Label>
          <Textarea
            id="fundingInfo"
            name="fundingInfo"
            defaultValue={application?.fundingInfo ?? ""}
            rows={2}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={application?.notes ?? ""} rows={4} />
        </div>
      </div>
      <Button type="submit">{application ? "Save changes" : "Create application"}</Button>
    </form>
  );
}
