import { PrismaPg } from "@prisma/adapter-pg";
import { getEnv } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma client singleton.
 *
 * Only modules under `src/server/repositories` may import this file
 * (enforced by ESLint). Everything else goes through a repository.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: getEnv().databaseUrl });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
