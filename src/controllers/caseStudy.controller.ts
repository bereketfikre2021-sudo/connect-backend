import { Request, Response, NextFunction } from 'express';
import * as caseStudyService from '../services/caseStudy.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = !!(req as AuthRequest).admin;
    const { data, total, page, limit } = await caseStudyService.getCaseStudies(req.query, isAdmin);
    sendPaginated(res, data, page, limit, total);
  } catch (err) { next(err); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cs = await caseStudyService.getCaseStudyBySlug(req.params.slug);
    if (!cs) { sendNotFound(res, 'Case study'); return; }
    sendSuccess(res, cs);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cs = await caseStudyService.getCaseStudyById(req.params.id);
    if (!cs) { sendNotFound(res, 'Case study'); return; }
    sendSuccess(res, cs);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (typeof data.challenge === 'string') data.challenge = JSON.parse(data.challenge);
    if (typeof data.role === 'string') data.role = JSON.parse(data.role);
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;

    const cs = await caseStudyService.createCaseStudy(data, file?.buffer);
    await logActivity('created', 'case-study', cs.id, cs.title);
    sendCreated(res, cs, 'Case study created');
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (typeof data.challenge === 'string') data.challenge = JSON.parse(data.challenge);
    if (typeof data.role === 'string') data.role = JSON.parse(data.role);
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;

    const cs = await caseStudyService.updateCaseStudy(req.params.id, data, file?.buffer);
    await logActivity('updated', 'case-study', cs.id, cs.title);
    sendSuccess(res, cs, 'Case study updated');
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await caseStudyService.deleteCaseStudy(req.params.id);
    sendSuccess(res, null, 'Case study deleted');
  } catch (err) { next(err); }
}
