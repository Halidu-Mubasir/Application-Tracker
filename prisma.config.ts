import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrate/Studio need a direct (non-pooled) connection. Point this at
    // Neon's direct connection string; the app itself connects through the
    // pooled DATABASE_URL via the adapter in src/lib/prisma.ts.
    //
    // Read via process.env rather than prisma/config's `env()` helper:
    // `env()` throws at config-load time if the var is unset, which broke
    // `prisma generate` (runs in postinstall, no DB needed) on Vercel
    // before any project env vars were configured. A plain lookup just
    // yields undefined there, and `generate` never touches it anyway.
    url: process.env.DIRECT_URL,
  },
});
