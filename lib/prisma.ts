
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Prisma, PrismaClient } from "../generated/prisma/client";

function createClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST!,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME!,
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchema: string | undefined;
};

// Hot reload preserves globals even when Prisma is regenerated with new fields.
const schema = JSON.stringify(
  Object.entries(Prisma).filter(([name]) => name.endsWith("ScalarFieldEnum")),
);
const cachedClient = globalForPrisma.prisma;
const canReuseClient = cachedClient && globalForPrisma.prismaSchema === schema;

export const prisma = canReuseClient ? cachedClient : createClient();

if (process.env.NODE_ENV !== "production") {
  if (cachedClient && cachedClient !== prisma) {
    void cachedClient.$disconnect().catch((error) => {
      console.error("Unable to disconnect the previous Prisma client", error);
    });
  }
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchema = schema;
}
