import { Request, Response, NextFunction } from 'express';
import * as testimonialService from '../services/testimonial.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isPublic = !(req as AuthRequest).admin;
    const featuredOnly = req.query.featured === 'true';
    const testimonials = await testimonialService.getTestimonials(isPublic, featuredOnly);
    sendSuccess(res, testimonials);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const t = await testimonialService.getTestimonialById(req.params.id);
    if (!t) { sendNotFound(res, 'Testimonial'); return; }
    sendSuccess(res, t);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (data.featured !== undefined) data.featured = data.featured === true || data.featured === 'true' || data.featured === 'on';
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (data.rating !== undefined) data.rating = parseInt(data.rating, 10) || 5;
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;
    const t = await testimonialService.createTestimonial(data, file?.buffer);
    await logActivity('created', 'testimonial', t.id, t.clientName);
    sendCreated(res, t, 'Testimonial created');
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (data.featured !== undefined) data.featured = data.featured === true || data.featured === 'true' || data.featured === 'on';
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (data.rating !== undefined) data.rating = parseInt(data.rating, 10) || 5;
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;
    const t = await testimonialService.updateTestimonial(req.params.id, data, file?.buffer);
    await logActivity('updated', 'testimonial', t.id, t.clientName);
    sendSuccess(res, t, 'Testimonial updated');
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await testimonialService.deleteTestimonial(req.params.id);
    sendSuccess(res, null, 'Testimonial deleted');
  } catch (err) { next(err); }
}

export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const testimonials = await testimonialService.reorderTestimonials(req.body.items);
    sendSuccess(res, testimonials, 'Order updated');
  } catch (err) { next(err); }
}
