import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/app/status-badge";
import { EmailThreads } from "@/components/app/email-threads";
import { Timeline } from "@/components/app/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RECOMMENDER_STATUS_LABEL } from "@/lib/constants";
import { Pencil, ExternalLink } from "lucide-react";

export default async function ContactDetailPage({
  params,
}: PageProps<"/contacts/[id]">) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      applications: { include: { application: true } },
      emailThreads: { include: { messages: { orderBy: { sentAt: "asc" } } } },
      events: { orderBy: { occurredAt: "desc" } },
      recommenderProfile: {
        include: { applications: { include: { application: true } } },
      },
    },
  });

  if (!contact) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{contact.name}</h1>
          <p className="text-muted-foreground">
            {[contact.university, contact.department].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/contacts/${id}/edit`}>
            <Pencil className="size-4" /> Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-1">
                {contact.researchTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {contact.email && <p>{contact.email}</p>}
                {contact.personalSite && (
                  <a
                    href={contact.personalSite}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 underline underline-offset-2"
                  >
                    Site <ExternalLink className="size-3" />
                  </a>
                )}
                {contact.scholarUrl && (
                  <a
                    href={contact.scholarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 underline underline-offset-2"
                  >
                    Scholar <ExternalLink className="size-3" />
                  </a>
                )}
                {contact.orcid && (
                  <a
                    href={contact.orcid}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 underline underline-offset-2"
                  >
                    ORCID <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              {contact.notes && (
                <p className="whitespace-pre-wrap text-muted-foreground">{contact.notes}</p>
              )}
            </CardContent>
          </Card>

          <Card id="emails">
            <CardHeader>
              <CardTitle className="text-base">Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailThreads threads={contact.emailThreads} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={contact.events} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.applications.map(({ application, role }) => (
                <Link
                  key={application.id}
                  href={`/applications/${application.id}`}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>
                    {application.school}
                    {role && <span className="text-muted-foreground"> · {role}</span>}
                  </span>
                  <StatusBadge status={application.status} />
                </Link>
              ))}
              {contact.applications.length === 0 && (
                <p className="text-sm text-muted-foreground">Not linked to an application yet.</p>
              )}
            </CardContent>
          </Card>

          {contact.recommenderProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommender for</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.recommenderProfile.applications.map(({ application, status }) => (
                  <Link
                    key={application.id}
                    href={`/applications/${application.id}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>{application.school}</span>
                    <Badge variant="outline">{RECOMMENDER_STATUS_LABEL[status]}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
