import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { MainNav } from "@/components/app/main-nav";
import { GlobalSearch } from "@/components/app/global-search";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col gap-5 border-r bg-sidebar p-3.5 md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-1.5 py-1 font-semibold tracking-tight">
          <span className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-brand text-primary-foreground">
            <GraduationCap className="size-3.5" strokeWidth={2} />
          </span>
          Grad App Tracker
        </Link>
        <MainNav />
        <div className="mt-auto space-y-1.5 border-t px-1.5 pt-3">
          <a
            href="/api/export"
            className="block text-xs text-muted-foreground transition-colors hover:text-brand"
          >
            Export all data
          </a>
          {session?.user?.email && (
            <p className="truncate text-[11px] text-muted-foreground/70">
              {session.user.email}
            </p>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <Button variant="ghost" size="sm" className="w-full justify-start px-0 text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-4 border-b bg-background/80 px-6 py-3.5 backdrop-blur-sm">
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
