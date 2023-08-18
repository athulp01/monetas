import * as process from "process";
import { Prisma, PrismaClient } from "@prisma/client";

export * from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };
const isVercel = !!process.env.VERCEL;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: isVercel
      ? {
          db: {
            url: process.env.POSTGRES_PRISMA_URL,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

export function bypassRLS() {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    }),
  );
}

export function forUser(userId: string) {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.user_id', ${userId}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    }),
  );
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
