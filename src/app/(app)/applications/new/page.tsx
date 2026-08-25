import { ApplicationForm } from "@/components/app/application-form";
import { createApplication } from "@/lib/actions/applications";

export default function NewApplicationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New application</h1>
      <ApplicationForm action={createApplication} />
    </div>
  );
}
