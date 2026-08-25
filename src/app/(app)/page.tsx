import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard";
import { StatusBadge } from "@/components/app/status-badge";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APPLICATION_STATUSES,
  FAMILY_BORDER_CLASSES,
  STATUS_FAMILY,
  STATUS_LABEL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock, Activity, CalendarCheck } from "lucide-react";
import { TIMELINE_EVENT_ICON } from "@/components/app/timeline";

export default async function DashboardPage() {
  const { upcomingDeadlines, staleApplications, statusCounts, recentEvents } =
    await getDashboardData();

  const countByStatus = new Map(statusCounts.map((c) => [c.status, c._count]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Where every application actually stands.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-2.5">
        {APPLICATION_STATUSES.map((status) => (
          <StatCard
            key={status}
            value={countByStatus.get(status) ?? 0}
            label={STATUS_LABEL[status]}
            family={STATUS_FAMILY[status]}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-muted-foreground" /> Upcoming deadlines (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingDeadlines.length === 0 && (
              <EmptyState
                icon={CalendarCheck}
                title="Nothing due in the next 30 days"
                description="Deadlines will show up here as soon as one's within a month out."
              />
            )}
            {upcomingDeadlines.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border-l-[3px] px-3.5 py-2.5 text-sm transition-colors hover:bg-secondary/60",
                  FAMILY_BORDER_CLASSES[STATUS_FAMILY[app.status]]
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
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
              <AlertTriangle className="size-4 text-muted-foreground" /> Stale applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {staleApplications.length === 0 && (
              <EmptyState
                icon={Activity}
                title="Nothing's gone quiet"
                description="Every active application has had activity in the last 30 days."
              />
            )}
            {staleApplications.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border-l-[3px] border-warning px-3.5 py-2.5 text-sm transition-colors hover:bg-secondary/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
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
        <CardContent>
          {recentEvents.length === 0 && (
            <EmptyState
              icon={Activity}
              title="No activity logged yet"
              description="Status changes, notes, and linked emails will show up here as you work."
            />
          )}
          <div className="space-y-4">
            {recentEvents.map((event) => {
              const Icon = TIMELINE_EVENT_ICON[event.type];
              return (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p>
                      {event.title}
                      {event.application && (
                        <>
                          {" — "}
                          <Link
                            href={`/applications/${event.application.id}`}
                            className="font-medium underline underline-offset-2"
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
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
