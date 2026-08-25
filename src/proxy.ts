import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  // /api/cron/* is excluded here and instead guarded by CRON_SECRET inside
  // the route itself, since Vercel Cron invocations carry no session.
  matcher: [
    "/((?!api/auth|api/cron|signin|_next/static|_next/image|favicon.ico).*)",
  ],
};
