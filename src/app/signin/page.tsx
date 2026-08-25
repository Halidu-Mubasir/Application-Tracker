import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default async function SignInPage({
  searchParams,
}: PageProps<"/signin">) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : "/";

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-lg border p-8 text-center">
        <GraduationCap className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Grad App Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with the Google account this tracker is configured for.
          </p>
        </div>
        <form action={signInWithGoogle} className="w-full">
          <Button type="submit" className="w-full">
            Continue with Google
          </Button>
        </form>
      </div>
    </main>
  );
}
