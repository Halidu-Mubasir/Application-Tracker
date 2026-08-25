# Grad App Tracker

Personal tracker for grad school applications, professor contacts,
documents, and email history. See `CLAUDE.md` for the stack, conventions,
and where things live.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in a Neon Postgres project, a
   Google OAuth client (Gmail readonly scope), a Vercel Blob store token,
   and a Resend API key. Details in `CLAUDE.md`.
3. `npx prisma migrate dev`
4. `npm run dev`
