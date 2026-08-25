import { format } from "date-fns";
import type { TimelineEvent } from "@prisma/client";
import {
  Mail,
  MailOpen,
  FileText,
  StickyNote,
  Flag,
  UserCheck,
  CircleDot,
} from "lucide-react";

const ICON: Record<TimelineEvent["type"], typeof Mail> = {
  STATUS_CHANGE: CircleDot,
  EMAIL_SENT: Mail,
  EMAIL_RECEIVED: MailOpen,
  DOCUMENT_LINKED: FileText,
  RECOMMENDER_UPDATE: UserCheck,
  DEADLINE: Flag,
  DECISION: Flag,
  NOTE: StickyNote,
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => {
        const Icon = ICON[event.type];
        return (
          <li key={event.id} className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-sm">{event.title}</p>
              {event.description && (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(event.occurredAt, "PPP p")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
