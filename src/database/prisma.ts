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
    log: config.isProd ? ['error'] : ['error', 'warn'],
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  });

if (!config.isProd) {
  global.__prisma = prisma;
}

/**
 * Wake up the Neon database by running a lightweight query.
 * Neon free tier suspends after ~5 min of inactivity — this pings it
 * with exponential backoff so the server never dies on a cold start.
 */
export async function connectWithRetry(maxAttempts = 5): Promise<void> {
  const INITIAL_DELAY_MS = 2_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return; // connected
    } catch (err: any) {
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt) throw err;

      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1); // 2s, 4s, 8s, 16s…
      console.warn(
        `[DB] Connection attempt ${attempt}/${maxAttempts} failed — ` +
          `Neon may be waking up. Retrying in ${delay / 1000}s…`,
        err?.message ?? err
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export default prisma;
