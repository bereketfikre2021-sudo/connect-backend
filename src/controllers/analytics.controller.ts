import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';
import * as ga4Service from '../services/ga4.service';
import { sendSuccess, sendCreated } from '../utils/apiResponse';

// ── Public: track event from frontend ────────────────────────────
export async function track(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, name, value, duration, scrollPct, visitorId, sessionId, page, slug } = req.body;
    const referrer = req.headers.referer || req.body.referrer;

    // Legacy page view (backward compat)
    if (page) {
      await analyticsService.recordView(page, slug, referrer);
    }

    // New event tracking
    if (type && name) {
      await analyticsService.recordEvent(
        visitorId || null,
        sessionId || null,
        type,
        name,
        value,
        duration,
        scrollPct,
      );
    }

    sendCreated(res, null, 'ok');
  } catch (err) { next(err); }
}

// ── Public: start a visit session ────────────────────────────────
export async function startVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await analyticsService.recordVisit(req);
    sendCreated(res, result || {}, 'ok');
  } catch (err) { next(err); }
}

// ── Public: end a session ─────────────────────────────────────────
export async function endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, duration } = req.body;
    if (sessionId && duration) {
      await analyticsService.endSession(sessionId, duration);
    }
    sendSuccess(res, null, 'ok');
  } catch (err) { next(err); }
}

// ── Admin: legacy stats ───────────────────────────────────────────
export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await analyticsService.getAnalytics();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
}

// ── Admin: full self-hosted analytics ────────────────────────────
export async function getFullStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsService.getFullAnalytics();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

// ── Admin: live analytics ─────────────────────────────────────────
export async function getLive(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsService.getLiveAnalytics();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}

// ── Admin: GA4 ────────────────────────────────────────────────────
export async function getGA4Stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await ga4Service.getGA4Report();
    sendSuccess(res, data);
  } catch (err) { next(err); }
}
