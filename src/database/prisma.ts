import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple Prisma Client instances in dev (hot reload)
const prisma =
  global.__prisma ??
  new PrismaClient({
    log: config.isProd ? ['error'] : ['query', 'error', 'warn'],
  });

if (!config.isProd) {
  global.__prisma = prisma;
}

export default prisma;
