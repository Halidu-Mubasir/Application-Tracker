import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicationForm } from "@/components/app/application-form";
import { updateApplication } from "@/lib/actions/applications";

export default async function EditApplicationPage({
  params,
}: PageProps<"/applications/[id]/edit">) {
  const { id } = await params;
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit application</h1>
      <ApplicationForm
        application={application}
        action={updateApplication.bind(null, id)}
      />
    </div>
  );
}
