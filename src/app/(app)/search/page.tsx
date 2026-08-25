import Link from "next/link";
import { runSearch } from "@/lib/search";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/app/empty-state";
import { SearchX } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const results = q ? await runSearch(q) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        {q && (
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          </p>
        )}
      </div>

      <div className="space-y-2">
        {results.map((r) => (
          <Link key={`${r.type}-${r.id}`} href={r.url}>
            <Card className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-elevation-md">
              <CardContent className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{r.subtitle}</p>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {r.type}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
        {q && results.length === 0 && (
          <div className="rounded-xl border bg-card shadow-elevation-sm">
            <EmptyState
              icon={SearchX}
              title="No results"
              description={`Nothing matched "${q}" across applications, contacts, emails, or documents.`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
