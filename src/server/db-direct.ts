import { PrismaClient } from "@prisma/client";

const globalForPrismaDirect = globalThis as unknown as {
  prismaDirect: PrismaClient | undefined;
};

let cachedPrismaDirect: PrismaClient | null = null;

export function getDbDirect(): PrismaClient {
  if (cachedPrismaDirect) return cachedPrismaDirect;

  if (globalForPrismaDirect.prismaDirect) {
    cachedPrismaDirect = globalForPrismaDirect.prismaDirect;
    return cachedPrismaDirect;
  }

  if (!process.env.DIRECT_URL) {
    throw new Error("DIRECT_URL environment variable is not set");
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrismaDirect.prismaDirect = client;
  }

  cachedPrismaDirect = client;
  return client;
}

// For backward compatibility - lazy getter
export const dbDirect = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getDbDirect();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});