import { prisma } from "@/lib/prisma";
import type { EventType } from "@prisma/client";

export function logEvent(params: {
  applicationId?: string;
  contactId?: string;
  type: EventType;
  title: string;
  description?: string;
  occurredAt?: Date;
}) {
  return prisma.timelineEvent.create({
    data: {
      applicationId: params.applicationId,
      contactId: params.contactId,
      type: params.type,
      title: params.title,
      description: params.description,
      occurredAt: params.occurredAt ?? new Date(),
    },
  });
}
