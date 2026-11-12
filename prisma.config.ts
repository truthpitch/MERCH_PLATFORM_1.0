/**
 * Prisma CLI config. DATABASE_PROVIDER picks the schema + migrations:
 *   sqlite (default, local dev)  → prisma/schema.prisma,       prisma/migrations
 *   mysql  (Hostinger)            → prisma/mysql/schema.prisma, prisma/mysql/migrations
 */
import { defineConfig } from "prisma/config";

// Prisma 7 doesn't read .env files itself; mirror Next.js (.env.local wins).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file not present — fine
  }
}

const mysql = process.env.DATABASE_PROVIDER === "mysql";

export default defineConfig({
  schema: mysql ? "prisma/mysql/schema.prisma" : "prisma/schema.prisma",
  migrations: {
    path: mysql ? "prisma/mysql/migrations" : "prisma/migrations",
    seed: "node node_modules/tsx/dist/cli.mjs prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
