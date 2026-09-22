import { PrismaClient } from "@prisma/client";

const globalForPrismaDirect = globalThis as unknown as {
  prismaDirect: PrismaClient | undefined;
};

function createPrismaDirectClient() {
  if (!process.env.DIRECT_URL) {
    throw new Error("DIRECT_URL environment variable is not set");
  }
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const dbDirect = globalForPrismaDirect.prismaDirect ?? createPrismaDirectClient();

if (process.env.NODE_ENV !== "production") globalForPrismaDirect.prismaDirect = dbDirect;