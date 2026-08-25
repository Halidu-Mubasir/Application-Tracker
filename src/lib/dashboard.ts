import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

const ACTIVE_STATUSES = [
  "PROF_CONTACTED",
  "SUBMITTED",
  "INTERVIEW",
  "DECISION_PENDING",
] as const;

const STALE_AFTER_DAYS = 30;

export async function getDashboardData() {
  const now = new Date();

  const [upcomingDeadlines, activeApplications, statusCounts, recentEvents] =
    await Promise.all([
      prisma.application.findMany({
        where: {
          deadline: { gte: now, lte: addDays(now, 30) },
          status: { notIn: ["ACCEPTED", "REJECTED", "WITHDRAWN"] },
        },
        orderBy: { deadline: "asc" },
      }),
      prisma.application.findMany({
        where: { status: { in: [...ACTIVE_STATUSES] } },
        include: {
          events: { orderBy: { occurredAt: "desc" }, take: 1 },
        },
      }),
      prisma.application.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.timelineEvent.findMany({
        orderBy: { occurredAt: "desc" },
        take: 10,
        include: { application: true, contact: true },
      }),
    ]);

  const staleCutoff = addDays(now, -STALE_AFTER_DAYS);
  const staleApplications = activeApplications
    .filter((app) => {
      const lastActivity = app.events[0]?.occurredAt ?? app.updatedAt;
      return lastActivity < staleCutoff;
    })
    .sort((a, b) => {
      const aDate = a.events[0]?.occurredAt ?? a.updatedAt;
      const bDate = b.events[0]?.occurredAt ?? b.updatedAt;
      return aDate.getTime() - bDate.getTime();
    });

  return {
    upcomingDeadlines,
    staleApplications,
    statusCounts,
    recentEvents,
  };
}
