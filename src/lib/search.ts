import { prisma } from "@/lib/prisma";

export interface SearchResult {
  type: "application" | "contact" | "email" | "document";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

/**
 * Fans a query out across the tables that matter for "who is this and what
 * did I say to them" lookups. Uses simple case-insensitive `contains`
 * matching rather than Postgres tsvector — at personal-tracker scale
 * (hundreds, not millions, of rows) this is fast enough and needs no
 * migration-time trigger/index setup. Revisit if the dataset ever grows
 * large enough for that tradeoff to flip.
 */
export async function runSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const [applications, contacts, emails, documents] = await Promise.all([
    prisma.application.findMany({
      where: {
        OR: [
          { school: { contains: q, mode: "insensitive" } },
          { program: { contains: q, mode: "insensitive" } },
          { department: { contains: q, mode: "insensitive" } },
          { notes: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
    }),
    prisma.contact.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { university: { contains: q, mode: "insensitive" } },
          { department: { contains: q, mode: "insensitive" } },
          { notes: { contains: q, mode: "insensitive" } },
          { researchTags: { has: q } },
        ],
      },
      take: 8,
    }),
    prisma.emailMessage.findMany({
      where: {
        OR: [
          { subject: { contains: q, mode: "insensitive" } },
          { bodyText: { contains: q, mode: "insensitive" } },
          { fromAddress: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { thread: { include: { contact: true, application: true } } },
      take: 8,
      orderBy: { sentAt: "desc" },
    }),
    prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { notes: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
    }),
  ]);

  return [
    ...applications.map(
      (a): SearchResult => ({
        type: "application",
        id: a.id,
        title: `${a.school} — ${a.program}`,
        subtitle: `${a.degreeType} · ${a.term} · ${a.status.replaceAll("_", " ")}`,
        url: `/applications/${a.id}`,
      })
    ),
    ...contacts.map(
      (c): SearchResult => ({
        type: "contact",
        id: c.id,
        title: c.name,
        subtitle: [c.university, c.department].filter(Boolean).join(" · "),
        url: `/contacts/${c.id}`,
      })
    ),
    ...emails.map((e): SearchResult => {
      const linkedTo =
        e.thread.application?.school ?? e.thread.contact?.name ?? "Unlinked";
      return {
        type: "email",
        id: e.id,
        title: e.subject || "(no subject)",
        subtitle: `${linkedTo} · ${e.fromAddress}`,
        url: e.thread.applicationId
          ? `/applications/${e.thread.applicationId}#emails`
          : e.thread.contactId
            ? `/contacts/${e.thread.contactId}#emails`
            : `/triage`,
      };
    }),
    ...documents.map(
      (d): SearchResult => ({
        type: "document",
        id: d.id,
        title: d.title,
        subtitle: d.type.replaceAll("_", " "),
        url: `/documents#${d.id}`,
      })
    ),
  ];
}
