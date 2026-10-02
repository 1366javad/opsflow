import "server-only";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" }),
  });

  globalForPrisma.prisma = prisma;
  return prisma;
}
