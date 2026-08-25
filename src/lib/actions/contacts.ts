"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  university: z.string().optional(),
  department: z.string().optional(),
  researchTags: z.string().optional(), // comma-separated in the form
  personalSite: z.string().optional(),
  scholarUrl: z.string().optional(),
  orcid: z.string().optional(),
  notes: z.string().optional(),
});

function parseContactForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.parse(raw);
  return {
    name: parsed.name,
    email: parsed.email || null,
    university: parsed.university || null,
    department: parsed.department || null,
    researchTags: (parsed.researchTags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    personalSite: parsed.personalSite || null,
    scholarUrl: parsed.scholarUrl || null,
    orcid: parsed.orcid || null,
    notes: parsed.notes || null,
  };
}

export async function createContact(formData: FormData) {
  const data = parseContactForm(formData);
  const contact = await prisma.contact.create({ data });
  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const data = parseContactForm(formData);
  await prisma.contact.update({ where: { id }, data });
  revalidatePath(`/contacts/${id}`);
  revalidatePath("/contacts");
  redirect(`/contacts/${id}`);
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
  redirect("/contacts");
}
