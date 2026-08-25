import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Scopes requested at login. gmail.readonly lets the app pull emails for
// triage; the same Google login doubles as the Gmail OAuth grant so there's
// only one auth flow. Tokens land in the Account table via PrismaAdapter.
const GMAIL_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The Prisma adapter still persists User/Account rows (so Google's
  // refresh_token lands in the Account table for Gmail API calls from cron),
  // but sessions are JWT-based so middleware can check auth at the edge
  // without a DB round trip.
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      authorization: {
        params: {
          scope: GMAIL_SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user }) {
      const allowedEmail = process.env.ALLOWED_EMAIL;
      return !!allowedEmail && user.email === allowedEmail;
    },
    async session({ session }) {
      return session;
    },
  },
});
