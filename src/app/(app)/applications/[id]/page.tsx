import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/app/status-badge";
import { Timeline } from "@/components/app/timeline";
import { EmailThreads } from "@/components/app/email-threads";
import { AddContactForm } from "@/components/app/add-contact-form";
import { AddDocumentForm } from "@/components/app/add-document-form";
import { AddRecommenderForm } from "@/components/app/add-recommender-form";
import { RecommenderStatusSelect } from "@/components/app/recommender-status-select";
import { AddNoteForm } from "@/components/app/add-note-form";
import { UnlinkButton } from "@/components/app/unlink-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/app/empty-state";
import { unlinkContactFromApplication } from "@/lib/actions/applications";
import { unlinkDocumentVersionFromApplication } from "@/lib/actions/documents";
import { removeRecommenderFromApplication } from "@/lib/actions/recommenders";
import { format } from "date-fns";
import { Pencil, ExternalLink, Users, FileText, UserCheck } from "lucide-react";

export default async function ApplicationDetailPage({
  params,
}: PageProps<"/applications/[id]">) {
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      contacts: { include: { contact: true } },
      documents: { include: { documentVersion: { include: { document: true } } } },
      recommenders: { include: { recommender: { include: { contact: true } } } },
      emailThreads: { include: { messages: { orderBy: { sentAt: "asc" } } } },
      events: { orderBy: { occurredAt: "desc" } },
    },
  });

  if (!application) notFound();

  const [allContacts, allDocumentVersions] = await Promise.all([
    prisma.contact.findMany({
      select: { id: true, name: true, university: true },
      orderBy: { name: "asc" },
    }),
    prisma.documentVersion.findMany({
      select: {
        id: true,
        label: true,
        versionNumber: true,
        document: { select: { title: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{application.school}</h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-muted-foreground">
            {application.program} · {application.degreeType} · {application.term}
            {application.department && ` · ${application.department}`}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/applications/${id}/edit`}>
            <Pencil className="size-4" /> Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key facts</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Deadline</p>
                <p>{application.deadline ? format(application.deadline, "PPP") : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Decision date</p>
                <p>{application.decisionDate ? format(application.decisionDate, "PPP") : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Portal</p>
                {application.portalUrl ? (
                  <a
                    href={application.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 underline underline-offset-2"
                  >
                    Open <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <p>—</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Funding</p>
                <p className="whitespace-pre-wrap">{application.fundingInfo || "—"}</p>
              </div>
              {application.notes && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap">{application.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card id="emails">
            <CardHeader>
              <CardTitle className="text-base">Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailThreads threads={application.emailThreads} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddNoteForm applicationId={id} />
              <Separator />
              <Timeline events={application.events} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.contacts.map(({ contact, role }) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60"
                >
                  <Link href={`/contacts/${contact.id}`} className="text-sm">
                    <span className="font-medium">{contact.name}</span>
                    {role && <span className="text-muted-foreground"> · {role}</span>}
                  </Link>
                  <UnlinkButton
                    action={unlinkContactFromApplication.bind(null, id, contact.id)}
                  />
                </div>
              ))}
              {application.contacts.length === 0 && (
                <EmptyState
                  className="py-5"
                  icon={Users}
                  title="No contacts linked yet"
                  description="Link a professor or POI once you've reached out."
                />
              )}
              <Separator />
              <AddContactForm applicationId={id} contacts={allContacts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.documents.map(({ documentVersion, roleNote }) => (
                <div
                  key={documentVersion.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60"
                >
                  <a
                    href={documentVersion.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline underline-offset-2"
                  >
                    {documentVersion.document.title} · v{documentVersion.versionNumber}
                    {roleNote && ` (${roleNote})`}
                  </a>
                  <UnlinkButton
                    action={unlinkDocumentVersionFromApplication.bind(
                      null,
                      id,
                      documentVersion.id
                    )}
                  />
                </div>
              ))}
              {application.documents.length === 0 && (
                <EmptyState
                  className="py-5"
                  icon={FileText}
                  title="No documents linked yet"
                  description="Attach an SOP, CV, or writing sample version."
                />
              )}
              <Separator />
              <AddDocumentForm applicationId={id} versions={allDocumentVersions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommenders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.recommenders.map(({ recommender, status }) => (
                <div
                  key={recommender.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60"
                >
                  <Link href={`/contacts/${recommender.contactId}`} className="text-sm">
                    {recommender.contact.name}
                  </Link>
                  <div className="flex items-center gap-1">
                    <RecommenderStatusSelect
                      applicationId={id}
                      recommenderId={recommender.id}
                      status={status}
                    />
                    <UnlinkButton
                      action={removeRecommenderFromApplication.bind(
                        null,
                        id,
                        recommender.id
                      )}
                    />
                  </div>
                </div>
              ))}
              {application.recommenders.length === 0 && (
                <EmptyState
                  className="py-5"
                  icon={UserCheck}
                  title="No recommenders yet"
                  description="Add one once you've asked someone to write for you."
                />
              )}
              <Separator />
              <AddRecommenderForm applicationId={id} contacts={allContacts} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
