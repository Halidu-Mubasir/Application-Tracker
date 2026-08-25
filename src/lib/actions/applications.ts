"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/actions/timeline";
import { APPLICATION_STATUSES, STATUS_LABEL } from "@/lib/constants";

const applicationSchema = z.object({
  school: z.string().min(1, "School is required"),
  program: z.string().min(1, "Program is required"),
  department: z.string().optional(),
  degreeType: z.string().min(1, "Degree type is required"),
  term: z.string().min(1, "Term is required"),
  status: z.enum(APPLICATION_STATUSES),
  deadline: z.string().optional(),
  decisionDate: z.string().optional(),
  portalUrl: z.string().optional(),
  fundingInfo: z.string().optional(),
  notes: z.string().optional(),
});

function parseApplicationForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = applicationSchema.parse(raw);
  return {
    school: parsed.school,
    program: parsed.program,
    department: parsed.department || null,
    degreeType: parsed.degreeType,
    term: parsed.term,
    status: parsed.status,
    deadline: parsed.deadline ? new Date(parsed.deadline) : null,
    decisionDate: parsed.decisionDate ? new Date(parsed.decisionDate) : null,
    portalUrl: parsed.portalUrl || null,
    fundingInfo: parsed.fundingInfo || null,
    notes: parsed.notes || null,
  };
}

export async function createApplication(formData: FormData) {
  const data = parseApplicationForm(formData);

  const application = await prisma.application.create({ data });

  await logEvent({
    applicationId: application.id,
    type: "STATUS_CHANGE",
    title: `Application created (${STATUS_LABEL[application.status]})`,
  });

  revalidatePath("/applications");
  redirect(`/applications/${application.id}`);
}

export async function updateApplication(id: string, formData: FormData) {
  const data = parseApplicationForm(formData);
  const existing = await prisma.application.findUniqueOrThrow({ where: { id } });

  const application = await prisma.application.update({
    where: { id },
    data,
  });

  if (existing.status !== application.status) {
    await logEvent({
      applicationId: id,
      type: "STATUS_CHANGE",
      title: `Status changed: ${STATUS_LABEL[existing.status]} → ${STATUS_LABEL[application.status]}`,
    });
  }

  if (
    ["ACCEPTED", "REJECTED", "WAITLISTED"].includes(application.status) &&
    existing.status !== application.status
  ) {
    await logEvent({
      applicationId: id,
      type: "DECISION",
      title: `Decision: ${STATUS_LABEL[application.status]}`,
    });
  }

  revalidatePath(`/applications/${id}`);
  revalidatePath("/applications");
  redirect(`/applications/${id}`);
}

export async function deleteApplication(id: string) {
  await prisma.application.delete({ where: { id } });
  revalidatePath("/applications");
  redirect("/applications");
}

export async function addNoteToApplication(id: string, formData: FormData) {
  const note = z.string().min(1).parse(formData.get("note"));
  await logEvent({
    applicationId: id,
    type: "NOTE",
    title: "Note added",
    description: note,
  });
  revalidatePath(`/applications/${id}`);
}

export async function linkContactToApplication(
  applicationId: string,
  formData: FormData
) {
  const contactId = z.string().min(1).parse(formData.get("contactId"));
  const role = (formData.get("role") as string) || null;

  await prisma.applicationContact.upsert({
    where: { applicationId_contactId: { applicationId, contactId } },
    update: { role },
    create: { applicationId, contactId, role },
  });

  const contact = await prisma.contact.findUniqueOrThrow({ where: { id: contactId } });
  await logEvent({
    applicationId,
    contactId,
    type: "NOTE",
    title: `Linked contact: ${contact.name}${role ? ` (${role})` : ""}`,
  });

  revalidatePath(`/applications/${applicationId}`);
}

export async function unlinkContactFromApplication(
  applicationId: string,
  contactId: string
) {
  await prisma.applicationContact.delete({
    where: { applicationId_contactId: { applicationId, contactId } },
  });
  revalidatePath(`/applications/${applicationId}`);
}
