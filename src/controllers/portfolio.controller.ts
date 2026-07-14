import { Request, Response, NextFunction } from 'express';
import * as portfolioService from '../services/portfolio.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = !!(req as AuthRequest).admin;
    const { data, total, page, limit } = await portfolioService.getPortfolioProjects(req.query, isAdmin);
    sendPaginated(res, data, page, limit, total);
  } catch (err) { next(err); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await portfolioService.getPortfolioBySlug(req.params.slug);
    if (!project) { sendNotFound(res, 'Project'); return; }
    sendSuccess(res, project);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await portfolioService.getPortfolioById(req.params.id);
    if (!project) { sendNotFound(res, 'Project'); return; }
    sendSuccess(res, project);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (typeof data.caseStudyResults === 'string') data.caseStudyResults = JSON.parse(data.caseStudyResults);
    if (typeof data.servicesProvided === 'string') data.servicesProvided = JSON.parse(data.servicesProvided);
    if (typeof data.technologies === 'string') data.technologies = JSON.parse(data.technologies);
    if (data.featured !== undefined) data.featured = data.featured === true || data.featured === 'true' || data.featured === 'on';
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (!data.status && data.published !== undefined) data.status = data.published ? 'published' : 'draft';
    if (data.status && data.published === undefined) data.published = data.status === 'published';
    if (data.year !== undefined && data.year !== '') data.year = parseInt(data.year, 10);
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;

    const project = await portfolioService.createPortfolioProject(data, file?.buffer);
    await logActivity('created', 'portfolio', project.id, project.title);
    sendCreated(res, project, 'Project created');
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (typeof data.caseStudyResults === 'string') data.caseStudyResults = JSON.parse(data.caseStudyResults);
    if (typeof data.servicesProvided === 'string') data.servicesProvided = JSON.parse(data.servicesProvided);
    if (typeof data.technologies === 'string') data.technologies = JSON.parse(data.technologies);
    if (data.featured !== undefined) data.featured = data.featured === true || data.featured === 'true' || data.featured === 'on';
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (!data.status && data.published !== undefined) data.status = data.published ? 'published' : 'draft';
    if (data.status && data.published === undefined) data.published = data.status === 'published';
    if (data.year !== undefined && data.year !== '') data.year = parseInt(data.year, 10);
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;

    const project = await portfolioService.updatePortfolioProject(req.params.id, data, file?.buffer);
    const action = data.status === 'published' ? 'published' : 'updated';
    await logActivity(action, 'portfolio', project.id, project.title);
    sendSuccess(res, project, 'Project updated');
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await portfolioService.deletePortfolioProject(req.params.id);
    sendSuccess(res, null, 'Project deleted');
  } catch (err) { next(err); }
}
