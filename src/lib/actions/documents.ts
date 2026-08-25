"use server";

import { z } from "zod";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/actions/timeline";
import { DOCUMENT_TYPES } from "@/lib/constants";

async function uploadFile(file: File) {
  const blob = await put(`documents/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return {
    fileUrl: blob.url,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

export async function createDocumentWithVersion(formData: FormData) {
  const type = z.enum(DOCUMENT_TYPES).parse(formData.get("type"));
  const title = z.string().min(1).parse(formData.get("title"));
  const label = (formData.get("label") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    throw new Error("A file is required");
  }

  const uploaded = await uploadFile(file);

  const document = await prisma.document.create({
    data: {
      type,
      title,
      notes,
      versions: {
        create: {
          versionNumber: 1,
          label,
          ...uploaded,
        },
      },
    },
  });

  revalidatePath("/documents");
  redirect(`/documents#${document.id}`);
}

export async function addDocumentVersion(documentId: string, formData: FormData) {
  const label = (formData.get("label") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    throw new Error("A file is required");
  }

  const uploaded = await uploadFile(file);

  const last = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: { versionNumber: "desc" },
  });

  await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: (last?.versionNumber ?? 0) + 1,
      label,
      notes,
      ...uploaded,
    },
  });

  revalidatePath("/documents");
  redirect(`/documents#${documentId}`);
}

export async function linkDocumentVersionToApplication(
  applicationId: string,
  formData: FormData
) {
  const documentVersionId = z.string().min(1).parse(formData.get("documentVersionId"));
  const roleNote = (formData.get("roleNote") as string) || null;

  await prisma.applicationDocument.upsert({
    where: {
      applicationId_documentVersionId: { applicationId, documentVersionId },
    },
    update: { roleNote },
    create: { applicationId, documentVersionId, roleNote },
  });

  const version = await prisma.documentVersion.findUniqueOrThrow({
    where: { id: documentVersionId },
    include: { document: true },
  });

  await logEvent({
    applicationId,
    type: "DOCUMENT_LINKED",
    title: `Linked ${version.document.title}${version.label ? ` (${version.label})` : ""}`,
  });

  revalidatePath(`/applications/${applicationId}`);
}

export async function unlinkDocumentVersionFromApplication(
  applicationId: string,
  documentVersionId: string
) {
  await prisma.applicationDocument.delete({
    where: {
      applicationId_documentVersionId: { applicationId, documentVersionId },
    },
  });
  revalidatePath(`/applications/${applicationId}`);
}
