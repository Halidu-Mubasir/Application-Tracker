import { format } from "date-fns";
import type { EmailMessage, EmailThread } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ThreadWithMessages = EmailThread & { messages: EmailMessage[] };

export function EmailThreads({ threads }: { threads: ThreadWithMessages[] }) {
  if (threads.length === 0) {
    return <p className="text-sm text-muted-foreground">No linked emails yet.</p>;
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {threads.map((thread) => (
        <AccordionItem key={thread.id} value={thread.id} className="rounded-md border px-3">
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
              <div key={message.id} className="rounded-md bg-muted/40 p-3 text-sm">
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
