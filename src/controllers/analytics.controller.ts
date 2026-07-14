import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';
import { sendSuccess, sendCreated } from '../utils/apiResponse';

export async function track(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, slug } = req.body;
    const referrer = req.headers.referer || req.body.referrer;
    if (!page) { res.status(400).json({ success: false, message: 'page required' }); return; }
    await analyticsService.recordView(page, slug, referrer);
    sendCreated(res, null, 'ok');
  } catch (err) { next(err); }
}

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await analyticsService.getAnalytics();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
}
