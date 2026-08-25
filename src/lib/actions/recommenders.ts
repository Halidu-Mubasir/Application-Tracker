"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/actions/timeline";
import { RECOMMENDER_STATUSES, RECOMMENDER_STATUS_LABEL } from "@/lib/constants";

export async function addRecommenderToApplication(
  applicationId: string,
  formData: FormData
) {
  const contactId = z.string().min(1).parse(formData.get("contactId"));
  const relationship = (formData.get("relationship") as string) || null;

  const recommender = await prisma.recommender.upsert({
    where: { contactId },
    update: relationship ? { relationship } : {},
    create: { contactId, relationship },
  });

  await prisma.recommenderApplication.upsert({
    where: {
      recommenderId_applicationId: {
        recommenderId: recommender.id,
        applicationId,
      },
    },
    update: {},
    create: { recommenderId: recommender.id, applicationId, status: "ASKED" },
  });

  const contact = await prisma.contact.findUniqueOrThrow({ where: { id: contactId } });
  await logEvent({
    applicationId,
    contactId,
    type: "RECOMMENDER_UPDATE",
    title: `Asked ${contact.name} for a recommendation`,
  });

  revalidatePath(`/applications/${applicationId}`);
}

export async function updateRecommenderStatus(
  applicationId: string,
  recommenderId: string,
  formData: FormData
) {
  const status = z.enum(RECOMMENDER_STATUSES).parse(formData.get("status"));
  const notes = (formData.get("notes") as string) || null;

  const now = new Date();
  await prisma.recommenderApplication.update({
    where: { recommenderId_applicationId: { recommenderId, applicationId } },
    data: {
      status,
      notes,
      askedDate: status === "ASKED" ? now : undefined,
      submittedDate: status === "SUBMITTED" ? now : undefined,
    },
  });

  const recommender = await prisma.recommender.findUniqueOrThrow({
    where: { id: recommenderId },
    include: { contact: true },
  });

  await logEvent({
    applicationId,
    contactId: recommender.contactId,
    type: "RECOMMENDER_UPDATE",
    title: `${recommender.contact.name}: ${RECOMMENDER_STATUS_LABEL[status]}`,
  });

  revalidatePath(`/applications/${applicationId}`);
}

export async function removeRecommenderFromApplication(
  applicationId: string,
  recommenderId: string
) {
  await prisma.recommenderApplication.delete({
    where: { recommenderId_applicationId: { recommenderId, applicationId } },
  });
  revalidatePath(`/applications/${applicationId}`);
}
