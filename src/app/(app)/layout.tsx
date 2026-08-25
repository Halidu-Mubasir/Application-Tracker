import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { MainNav } from "@/components/app/main-nav";
import { GlobalSearch } from "@/components/app/global-search";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r p-4 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2 font-semibold">
          <GraduationCap className="size-5" />
          Grad App Tracker
        </Link>
        <MainNav />
        <div className="mt-auto space-y-2 px-2 pt-4">
          <a
            href="/api/export"
            className="block text-xs text-muted-foreground underline underline-offset-2"
          >
            Export all data
          </a>
          {session?.user?.email && (
            <p className="truncate text-xs text-muted-foreground">
              {session.user.email}
            </p>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <Button variant="ghost" size="sm" className="w-full justify-start px-0">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-4 border-b p-4">
          <GlobalSearch />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
