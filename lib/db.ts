/**
 * Prisma client singleton.
 *
 * DATABASE_PROVIDER selects the driver adapter (Prisma 7, no native query engine):
 *   sqlite → better-sqlite3   (local dev; optional dependency)
 *   mysql  → mariadb          (pure JavaScript — works on Hostinger's older Linux)
 *
 * Adapters are loaded with Node's own require at runtime (hidden from the
 * bundler via eval) so a build never tries to resolve the driver that isn't
 * installed in that environment — better-sqlite3 is optional and may be
 * absent on Hostinger, which only needs the pure-JS mariadb driver.
 */
import { PrismaClient } from "@/generated/prisma/client";

const runtimeRequire: NodeJS.Require = eval("require");

function mysqlConfig(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 5),
  };
}

function createClient(): PrismaClient {
  const provider = process.env.DATABASE_PROVIDER ?? "sqlite";
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  if (provider === "mysql") {
    const { PrismaMariaDb } = runtimeRequire("@prisma/adapter-mariadb") as typeof import("@prisma/adapter-mariadb");
    return new PrismaClient({ adapter: new PrismaMariaDb(mysqlConfig(url)) });
  }

  const { PrismaBetterSqlite3 } = runtimeRequire(
    "@prisma/adapter-better-sqlite3",
  ) as typeof import("@prisma/adapter-better-sqlite3");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

const globalForDb = globalThis as unknown as { __tpDb?: PrismaClient };

export const db: PrismaClient = globalForDb.__tpDb ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.__tpDb = db;
