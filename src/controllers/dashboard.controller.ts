import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await dashboardService.getDashboardStats();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
}
