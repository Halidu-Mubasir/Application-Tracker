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
  Activity,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";

export const TIMELINE_EVENT_ICON: Record<TimelineEvent["type"], typeof Mail> = {
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
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Status changes, notes, and linked emails will show up here."
      />
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => {
        const Icon = TIMELINE_EVENT_ICON[event.type];
        return (
          <li key={event.id} className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
            </span>
            <div className="space-y-0.5 pt-0.5">
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
