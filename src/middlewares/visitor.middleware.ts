import { Request, Response, NextFunction } from 'express';
import { recordVisit, isBot } from '../services/analytics.service';
import { config } from '../config/env';

// Paths to skip tracking on
const SKIP_PREFIXES = ['/api/v1/auth', '/api/v1/analytics', '/health', '/sitemap', '/robots'];

export async function visitorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const origin = req.headers.origin || req.headers.referer || '';
    const ua = (req.headers['user-agent'] || '').toString();

    // Only track requests from the frontend domain
    const allowedOrigins = config.cors.allowedOrigins;
    const isFromFrontend = allowedOrigins.some((o) => origin.startsWith(o));

    // Skip conditions
    const shouldSkip =
      !isFromFrontend ||
      isBot(ua) ||
      SKIP_PREFIXES.some((p) => req.path.startsWith(p)) ||
      req.method === 'OPTIONS';

    if (!shouldSkip) {
      const result = await recordVisit(req);
      if (result) {
        res.locals.visitorId = result.visitorId;
        res.locals.sessionId = result.sessionId;
      }
    }
  } catch {
    // Never crash the main request pipeline
  }
  next();
}
