import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABEL } from "@/lib/constants";
import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock } from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";

export default async function DashboardPage() {
  const { upcomingDeadlines, staleApplications, statusCounts, recentEvents } =
    await getDashboardData();

  const countByStatus = new Map(
    statusCounts.map((c) => [c.status, c._count])
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Where every application actually stands.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <p className="text-2xl font-semibold">
                {countByStatus.get(status) ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {STATUS_LABEL[status]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" /> Upcoming deadlines (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing due in the next 30 days.
              </p>
            )}
            {upcomingDeadlines.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-secondary/50"
              >
                <div>
                  <p className="font-medium">
                    {app.school} — {app.program}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.deadline && format(app.deadline, "PPP")}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4" /> Stale applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {staleApplications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing&apos;s gone quiet for 30+ days. Good.
              </p>
            )}
            {staleApplications.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-secondary/50"
              >
                <div>
                  <p className="font-medium">
                    {app.school} — {app.program}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No activity since{" "}
                    {formatDistanceToNow(app.events[0]?.occurredAt ?? app.updatedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No activity logged yet.
            </p>
          )}
          {recentEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-sm">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <div>
                <p>
                  {event.title}
                  {event.application && (
                    <>
                      {" "}
                      —{" "}
                      <Link
                        href={`/applications/${event.application.id}`}
                        className="underline underline-offset-2"
                      >
                        {event.application.school}
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(event.occurredAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
