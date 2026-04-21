import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let cachedDb: PrismaClient | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export function getDb(): PrismaClient {
  if (cachedDb) return cachedDb;
  if (globalForPrisma.prisma) {
    cachedDb = globalForPrisma.prisma;
    return cachedDb;
  }

  cachedDb = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = cachedDb;
  }

  return cachedDb;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getDb();
    return Reflect.get(client, prop, receiver);
  },
});
