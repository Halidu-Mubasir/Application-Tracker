import { prisma } from "@/lib/prisma";
import { syncAndGetTriageCandidates } from "@/lib/gmail";
import { TriageCandidateCard } from "@/components/app/triage-candidate-card";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox, AlertTriangle } from "lucide-react";

export default async function TriagePage() {
  let candidates: Awaited<ReturnType<typeof syncAndGetTriageCandidates>> = [];
  let error: string | null = null;

  try {
    candidates = await syncAndGetTriageCandidates();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to reach Gmail.";
  }

  const [applications, contacts] = await Promise.all([
    prisma.application.findMany({
      select: { id: true, school: true, program: true },
      orderBy: { school: "asc" },
    }),
    prisma.contact.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gmail triage</h1>
        <p className="text-sm text-muted-foreground">
          Application-shaped emails not yet linked to anything. Replies in
          threads you&apos;ve already linked are attached automatically and
          won&apos;t show up here.
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="flex items-start gap-3 pt-6 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {!error && candidates.length === 0 && (
        <div className="rounded-xl border bg-card shadow-elevation-sm">
          <EmptyState
            icon={Inbox}
            title="No new candidate emails right now"
            description="Check back after emailing a professor or hearing from one — matches show up here for you to link."
          />
        </div>
      )}

      <div className="space-y-3">
        {candidates.map((candidate) => (
          <TriageCandidateCard
            key={candidate.threadId}
            candidate={candidate}
            applications={applications}
            contacts={contacts}
          />
        ))}
      </div>
    </div>
  );
}
