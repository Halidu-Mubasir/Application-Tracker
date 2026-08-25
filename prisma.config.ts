import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrate/Studio need a direct (non-pooled) connection. Point this at
    // Neon's direct connection string; the app itself connects through the
    // pooled DATABASE_URL via the adapter in src/lib/prisma.ts.
    url: env("DIRECT_URL"),
  },
});
