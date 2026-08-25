import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewDocumentDialog } from "@/components/app/new-document-dialog";
import { NewVersionDialog } from "@/components/app/new-version-dialog";
import { DOCUMENT_TYPE_LABEL } from "@/lib/constants";
import { format } from "date-fns";
import { Download } from "lucide-react";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        include: { applications: { include: { application: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="text-sm text-muted-foreground">
            SOPs, CVs, writing samples — versioned and linked to applications.
          </p>
        </div>
        <NewDocumentDialog />
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} id={doc.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{doc.title}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {DOCUMENT_TYPE_LABEL[doc.type]}
                </Badge>
              </div>
              <NewVersionDialog documentId={doc.id} />
            </CardHeader>
            <CardContent className="space-y-2">
              {doc.versions.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm"
                >
                  <div>
                    <a
                      href={v.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 font-medium underline underline-offset-2"
                    >
                      <Download className="size-3.5" />
                      v{v.versionNumber}
                      {v.label ? ` — ${v.label}` : ""}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {format(v.createdAt, "PP")} ·{" "}
                      {v.applications.length === 0
                        ? "not linked to any application"
                        : v.applications
                            .map((a) => a.application.school)
                            .join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
