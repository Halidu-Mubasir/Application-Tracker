# Grad App Tracker

Personal (single-user) tracker for grad school applications, professor
contacts, documents, and email history. The centerpiece is the Application
detail page and full-text search — the point is to look up "what did I say
to this person, what did I submit, where does this stand" in seconds.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 + shadcn/ui
(Radix base, Nova preset) · Prisma 7 + Postgres/Neon · NextAuth v5 (Google,
single whitelisted email) · Vercel Blob (document files) · Resend (deadline
digest emails) · googleapis (Gmail triage) · deployed on Vercel.

## Conventions

- **Reads** happen directly in Server Components via `prisma` from
  `src/lib/prisma.ts`. **Writes** are Server Actions in `src/lib/actions/*.ts`
  (`"use server"`), not API routes — API routes are reserved for things a
  browser form can't do (NextAuth, Gmail triage's own OAuth calls, search-box
  fetch, cron, export).
- **shadcn `Select` has no `name` prop** (it's not a native `<select>`). Every
  form that needs one mirrors the chosen value into a hidden `<input>` via
  controlled state. See `src/components/app/add-contact-form.tsx` for the
  pattern and copy it rather than reinventing it.
- **`TimelineEvent` is an explicit log, not derived.** Any action that
  changes real state (status change, note, linked contact/document,
  recommender update, email triaged) should call `logEvent()` from
  `src/lib/actions/timeline.ts` so the Application/Contact timeline stays
  complete.
- **Prisma 7 config**: no `url`/`directUrl` in `schema.prisma` anymore.
  `prisma.config.ts` holds the direct connection (for `migrate`/`studio`);
  `src/lib/prisma.ts` builds the runtime client from the pooled
  `DATABASE_URL` via `@prisma/adapter-pg`.
- **`src/proxy.ts`**, not `middleware.ts` — Next 16 renamed the convention.
  Same default-export-function shape; it gates every route except
  `/api/auth`, `/api/cron`, `/signin`.
- **Search** (`src/lib/search.ts`) is a `contains`/ILIKE fan-out across
  Application/Contact/EmailMessage/Document, not Postgres `tsvector`. Fine at
  personal-tracker scale (hundreds of rows); revisit only if that changes.
- **Gmail triage** auto-attaches replies in already-linked threads (see
  `syncAndGetTriageCandidates` in `src/lib/gmail.ts`) and only surfaces
  genuinely new threads for manual triage in `/triage`.

## Where things live

- `prisma/schema.prisma` — schema (source of truth for the data model)
- `src/lib/actions/` — all mutations (applications, contacts, documents,
  recommenders, gmail-triage, timeline)
- `src/lib/{prisma,auth,gmail,search,dashboard,email,constants}.ts` — core
  server-side logic
- `src/app/(app)/` — authenticated pages (dashboard, applications, contacts,
  documents, triage, search); `src/app/signin` — the only public page
- `src/components/app/` — app-specific components; `src/components/ui/` —
  shadcn primitives (don't hand-edit these beyond what `shadcn add` needs)

## Environment / one-time setup

Copy `.env.example` → `.env` and fill in: a Neon Postgres project (pooled
`DATABASE_URL` + direct `DIRECT_URL`), a Google Cloud OAuth client with the
Gmail readonly scope enabled and `http://localhost:3000/api/auth/callback/google`
(and the prod URL) as a redirect URI, a Vercel Blob store token, and a Resend
API key + verified sender for the deadline digest. Then:

```
npx prisma migrate dev
```

`vercel.json` schedules the deadline digest cron; it authenticates itself via
`CRON_SECRET`, which Vercel injects automatically as a Bearer token when the
env var is set on the project.

## Skills

- `/add-entity` — adding a new Prisma model end-to-end (schema, migration,
  constants, actions)
- `/add-app-page` — adding a new page under `src/app/(app)/` that matches
  existing data-fetching/form/action conventions
- `/gmail-triage-check` — running and sanity-checking the Gmail triage flow
  locally
