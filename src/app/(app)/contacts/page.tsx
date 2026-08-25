import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} total</p>
        </div>
        <Button asChild>
          <Link href="/contacts/new">
            <Plus className="size-4" /> New contact
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Link key={contact.id} href={`/contacts/${contact.id}`}>
            <Card className="h-full transition-colors hover:bg-secondary/50">
              <CardContent className="space-y-2 pt-6">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[contact.university, contact.department].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {contact.researchTags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {contact._count.applications} linked application
                  {contact._count.applications === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {contacts.length === 0 && (
          <p className="text-sm text-muted-foreground">No contacts yet.</p>
        )}
      </div>
    </div>
  );
}
