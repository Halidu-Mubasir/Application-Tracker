import { ContactForm } from "@/components/app/contact-form";
import { createContact } from "@/lib/actions/contacts";

export default function NewContactPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New contact</h1>
      <ContactForm action={createContact} />
    </div>
  );
}
