import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple PrismaClient instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function to gracefully disconnect Prisma
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
