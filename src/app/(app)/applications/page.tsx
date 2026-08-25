import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/app/status-badge";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: [{ deadline: "asc" }, { school: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">
            {applications.length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Plus className="size-4" /> New application
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-elevation-sm">
        {applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Add one to start tracking deadlines, contacts, and documents in one place."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>School</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/applications/${app.id}`} className="block font-medium">
                      {app.school}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/applications/${app.id}`} className="block">
                      {app.program}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{app.degreeType}</TableCell>
                  <TableCell className="text-muted-foreground">{app.term}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.deadline ? format(app.deadline, "PP") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
