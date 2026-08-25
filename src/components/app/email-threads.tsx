import { format } from "date-fns";
import type { EmailMessage, EmailThread } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState } from "@/components/app/empty-state";
import { Mail } from "lucide-react";

type ThreadWithMessages = EmailThread & { messages: EmailMessage[] };

export function EmailThreads({ threads }: { threads: ThreadWithMessages[] }) {
  if (threads.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No linked emails yet"
        description="Emails you triage from Gmail will show up here, threaded together."
      />
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {threads.map((thread) => (
        <AccordionItem key={thread.id} value={thread.id} className="rounded-lg border px-3">
          <AccordionTrigger className="text-sm">
            <div className="flex flex-1 flex-col items-start text-left">
              <span className="font-medium">{thread.subject || "(no subject)"}</span>
              <span className="text-xs text-muted-foreground">
                {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"}
                {thread.lastMessageAt && ` · last ${format(thread.lastMessageAt, "PP")}`}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {thread.messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {message.direction === "OUTBOUND" ? "You" : message.fromAddress}
                  </span>
                  <span>{format(message.sentAt, "PPP p")}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap">
                  {message.bodyText || message.snippet}
                </p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
