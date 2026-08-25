"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getThreadMessages } from "@/lib/gmail";
import { logEvent } from "@/lib/actions/timeline";

const triageSchema = z.object({
  threadId: z.string().min(1),
  target: z.enum(["application", "contact", "new-contact", "skip"]),
  applicationId: z.string().optional(),
  contactId: z.string().optional(),
  newContactName: z.string().optional(),
  newContactUniversity: z.string().optional(),
});

export async function triageThread(formData: FormData) {
  const parsed = triageSchema.parse(Object.fromEntries(formData.entries()));

  let applicationId: string | null = null;
  let contactId: string | null = null;

  if (parsed.target === "application") {
    applicationId = z.string().min(1).parse(parsed.applicationId);
  } else if (parsed.target === "contact") {
    contactId = z.string().min(1).parse(parsed.contactId);
  } else if (parsed.target === "new-contact") {
    const name = z.string().min(1).parse(parsed.newContactName);
    const contact = await prisma.contact.create({
      data: {
        name,
        university: parsed.newContactUniversity || null,
      },
    });
    contactId = contact.id;
  }
  // target === "skip" leaves both null: the thread is stored (so it stops
  // showing up as a candidate) but isn't linked to anything.

  const messages = await getThreadMessages(parsed.threadId);
  if (messages.length === 0) return;

  const subject = messages[0].subject;

  const thread = await prisma.emailThread.create({
    data: {
      gmailThreadId: parsed.threadId,
      subject,
      applicationId,
      contactId,
      lastMessageAt: messages[messages.length - 1].internalDate,
      messages: {
        create: messages.map((m) => ({
          gmailMessageId: m.id,
          direction: m.isFromMe ? "OUTBOUND" : "INBOUND",
          fromAddress: m.from,
          toAddresses: m.to,
          subject: m.subject,
          bodyText: m.bodyText,
          snippet: m.snippet,
          sentAt: m.internalDate,
          isTriaged: true,
        })),
      },
    },
  });

  if (applicationId || contactId) {
    await logEvent({
      applicationId: applicationId ?? undefined,
      contactId: contactId ?? undefined,
      type: "EMAIL_RECEIVED",
      title: `Linked email thread: ${subject || "(no subject)"}`,
    });
  }

  revalidatePath("/triage");
  if (applicationId) revalidatePath(`/applications/${applicationId}`);
  if (contactId) revalidatePath(`/contacts/${contactId}`);

  return thread;
}
