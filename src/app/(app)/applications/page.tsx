import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/app/status-badge";
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
import { Plus } from "lucide-react";

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: [{ deadline: "asc" }, { school: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell>{app.degreeType}</TableCell>
                <TableCell>{app.term}</TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
                <TableCell>
                  {app.deadline ? format(app.deadline, "PP") : "—"}
                </TableCell>
              </TableRow>
            ))}
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No applications yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
