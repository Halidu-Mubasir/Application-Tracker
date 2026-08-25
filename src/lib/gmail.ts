import { google, gmail_v1 } from "googleapis";
import { prisma } from "@/lib/prisma";

/**
 * Builds an authenticated Gmail client using the refresh token stored on the
 * single Google Account row created at sign-in. Works outside a request
 * session (e.g. from a cron job) since it goes straight to the DB rather
 * than relying on the NextAuth JWT.
 */
export async function getGmailClient() {
  const account = await prisma.account.findFirst({
    where: { provider: "google" },
  });

  if (!account?.refresh_token) {
    throw new Error(
      "No Google account with a refresh token found. Sign in again and grant Gmail access."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );

  oauth2Client.setCredentials({ refresh_token: account.refresh_token });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

// Heuristics for surfacing application-relevant emails during triage.
// Gmail search syntax: https://support.google.com/mail/answer/7190
export const TRIAGE_QUERY = [
  "(",
  "  from:*.edu OR",
  "  subject:(application OR admission OR admissions OR interview OR PhD OR graduate OR fellowship OR funding OR recommendation)",
  ")",
  "-category:promotions",
  "-category:social",
].join(" ");

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string | null;
  from: string;
  to: string[];
  snippet: string;
  bodyText: string | null;
  internalDate: Date;
  isFromMe: boolean;
}

function decodeBody(payload: unknown): string | null {
  type Part = {
    mimeType?: string;
    body?: { data?: string | null };
    parts?: Part[];
  };

  function extract(part: Part): string | null {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return Buffer.from(part.body.data, "base64url").toString("utf-8");
    }
    if (part.parts) {
      for (const child of part.parts) {
        const found = extract(child);
        if (found) return found;
      }
    }
    return null;
  }

  return extract(payload as Part);
}

function headerValue(
  headers: { name?: string | null; value?: string | null }[] | undefined,
  name: string
): string | null {
  return (
    headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? null
  );
}

async function toSummary(
  gmail: gmail_v1.Gmail,
  id: string,
  myEmail: string
): Promise<GmailMessageSummary> {
  const res = await gmail.users.messages.get({ userId: "me", id, format: "full" });
  const headers = res.data.payload?.headers ?? [];
  const from = headerValue(headers, "From") ?? "";
  return {
    id: res.data.id!,
    threadId: res.data.threadId!,
    subject: headerValue(headers, "Subject"),
    from,
    to: (headerValue(headers, "To") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    snippet: res.data.snippet ?? "",
    bodyText: decodeBody(res.data.payload),
    internalDate: new Date(Number(res.data.internalDate ?? Date.now())),
    isFromMe: from.toLowerCase().includes(myEmail.toLowerCase()),
  };
}

export interface TriageCandidateThread {
  threadId: string;
  representative: GmailMessageSummary;
  messageCount: number;
}

/**
 * Fetches heuristic-matched Gmail messages not yet stored locally, then
 * splits them in two:
 *  - messages whose thread is already linked to an Application/Contact get
 *    silently attached (this is what makes future replies "just show up").
 *  - messages in a genuinely new thread come back as one candidate per
 *    thread for manual triage.
 */
export async function syncAndGetTriageCandidates(
  maxResults = 25
): Promise<TriageCandidateThread[]> {
  const gmail = await getGmailClient();
  const myEmail = process.env.ALLOWED_EMAIL ?? "";

  const existingMessageIds = new Set(
    (
      await prisma.emailMessage.findMany({ select: { gmailMessageId: true } })
    ).map((m) => m.gmailMessageId)
  );

  const list = await gmail.users.messages.list({
    userId: "me",
    q: TRIAGE_QUERY,
    maxResults: maxResults * 3,
  });

  const candidateIds = (list.data.messages ?? [])
    .map((m) => m.id)
    .filter((id): id is string => !!id && !existingMessageIds.has(id));

  const summaries = await Promise.all(
    candidateIds.map((id) => toSummary(gmail, id, myEmail))
  );

  const knownThreads = await prisma.emailThread.findMany({
    where: { gmailThreadId: { in: [...new Set(summaries.map((s) => s.threadId))] } },
  });
  const knownThreadIds = new Map(knownThreads.map((t) => [t.gmailThreadId, t]));

  const newThreadGroups = new Map<string, GmailMessageSummary[]>();

  for (const summary of summaries) {
    const known = knownThreadIds.get(summary.threadId);
    if (known) {
      await prisma.emailMessage.create({
        data: {
          threadId: known.id,
          gmailMessageId: summary.id,
          direction: summary.isFromMe ? "OUTBOUND" : "INBOUND",
          fromAddress: summary.from,
          toAddresses: summary.to,
          subject: summary.subject,
          bodyText: summary.bodyText,
          snippet: summary.snippet,
          sentAt: summary.internalDate,
          isTriaged: true,
        },
      });
      await prisma.emailThread.update({
        where: { id: known.id },
        data: { lastMessageAt: summary.internalDate },
      });
      await prisma.timelineEvent.create({
        data: {
          applicationId: known.applicationId,
          contactId: known.contactId,
          type: summary.isFromMe ? "EMAIL_SENT" : "EMAIL_RECEIVED",
          title: `${summary.isFromMe ? "Sent" : "Received"}: ${summary.subject || "(no subject)"}`,
          occurredAt: summary.internalDate,
        },
      });
      continue;
    }

    const group = newThreadGroups.get(summary.threadId) ?? [];
    group.push(summary);
    newThreadGroups.set(summary.threadId, group);
  }

  return [...newThreadGroups.entries()]
    .map(([threadId, messages]) => {
      const representative = messages.sort(
        (a, b) => b.internalDate.getTime() - a.internalDate.getTime()
      )[0];
      return { threadId, representative, messageCount: messages.length };
    })
    .sort(
      (a, b) =>
        b.representative.internalDate.getTime() -
        a.representative.internalDate.getTime()
    )
    .slice(0, maxResults);
}

/** Fetches every message in a Gmail thread, for when a candidate gets triaged. */
export async function getThreadMessages(
  threadId: string
): Promise<GmailMessageSummary[]> {
  const gmail = await getGmailClient();
  const myEmail = process.env.ALLOWED_EMAIL ?? "";

  const thread = await gmail.users.threads.get({ userId: "me", id: threadId });
  const messageIds = (thread.data.messages ?? [])
    .map((m) => m.id)
    .filter((id): id is string => !!id);

  return Promise.all(messageIds.map((id) => toSummary(gmail, id, myEmail)));
}
