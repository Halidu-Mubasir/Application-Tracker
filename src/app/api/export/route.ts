import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Full data export/backup. Returns every table as JSON. This is personal
 * application data with no other consumers, so a straight relational dump
 * (no pagination, no redaction) is the right level of complexity.
 */
export async function GET() {
  const [
    applications,
    contacts,
    applicationContacts,
    documents,
    documentVersions,
    applicationDocuments,
    recommenders,
    recommenderApplications,
    emailThreads,
    emailMessages,
    timelineEvents,
  ] = await Promise.all([
    prisma.application.findMany(),
    prisma.contact.findMany(),
    prisma.applicationContact.findMany(),
    prisma.document.findMany(),
    prisma.documentVersion.findMany(),
    prisma.applicationDocument.findMany(),
    prisma.recommender.findMany(),
    prisma.recommenderApplication.findMany(),
    prisma.emailThread.findMany(),
    prisma.emailMessage.findMany(),
    prisma.timelineEvent.findMany(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: {
      applications,
      contacts,
      applicationContacts,
      documents,
      documentVersions,
      applicationDocuments,
      recommenders,
      recommenderApplications,
      emailThreads,
      emailMessages,
      timelineEvents,
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="grad-app-tracker-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
