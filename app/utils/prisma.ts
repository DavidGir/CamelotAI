import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Creates the Prisma Client instance globally if it doesn't already exist:
const client = globalThis.prisma || new PrismaClient();
// Caches the Prisma Client instance in development mode meaning that in development the same client instance is resused preventing excessive connections during dev.
// This is not necessary in production as we want a fresh client instance for each request.
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;

export default client;