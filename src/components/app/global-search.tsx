"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/search";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPE_LABEL: Record<SearchResult["type"], string> = {
  application: "Applications",
  contact: "Contacts",
  email: "Emails",
  document: "Documents",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        // ignore aborted/failed requests
      }
    }, 150);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const visibleResults = query.trim() ? results : [];

  const groupedResults = new Map<SearchResult["type"], SearchResult[]>();
  for (const r of visibleResults) {
    groupedResults.set(r.type, [...(groupedResults.get(r.type) ?? []), r]);
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full max-w-sm justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Search applications, contacts, emails…
        <kbd className="ml-auto text-xs text-muted-foreground">⌘K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search applications, contacts, emails, documents…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query.trim() ? "No results." : "Start typing to search."}
          </CommandEmpty>
          {[...groupedResults.entries()].map(([type, items]) => (
            <CommandGroup key={type} heading={TYPE_LABEL[type]}>
              {items.map((item) => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  value={`${item.type}-${item.id}-${item.title}`}
                  onSelect={() => {
                    setOpen(false);
                    setQuery("");
                    router.push(item.url);
                  }}
                >
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
