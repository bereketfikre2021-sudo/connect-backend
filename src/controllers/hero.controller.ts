import { Request, Response, NextFunction } from 'express';
import * as heroService from '../services/hero.service';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Public route returns only published; admin route returns all
    const isPublic = !(req as any).admin;
    const slides = await heroService.getAllHeroSlides(isPublic);
    sendSuccess(res, slides);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slide = await heroService.getHeroSlideById(req.params.id);
    if (!slide) { sendNotFound(res, 'Hero slide'); return; }
    sendSuccess(res, slide);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };

    // Coerce numeric fields from FormData strings
    if (data.autoSlideDelay !== undefined) data.autoSlideDelay = parseInt(data.autoSlideDelay, 10) || 4000;
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;

    // Status takes priority; derive published from it
    if (data.status) {
      data.published = data.status === 'active';
    } else if (data.published !== undefined) {
      data.published = data.published === true || data.published === 'true' || data.published === 'on';
      data.status = data.published ? 'active' : 'inactive';
    } else {
      data.status = 'active';
      data.published = true;
    }

    const slide = await heroService.createHeroSlide(data, file?.buffer);
    await logActivity('created', 'hero', slide.id, slide.headline || slide.altText || 'Hero Slide');
    sendCreated(res, slide, 'Hero slide created');
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };

    if (data.autoSlideDelay !== undefined) data.autoSlideDelay = parseInt(data.autoSlideDelay, 10) || 4000;
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;

    if (data.status) {
      data.published = data.status === 'active';
    } else if (data.published !== undefined) {
      data.published = data.published === true || data.published === 'true' || data.published === 'on';
      data.status = data.published ? 'active' : 'inactive';
    }

    const slide = await heroService.updateHeroSlide(req.params.id, data, file?.buffer);
    await logActivity('updated', 'hero', slide.id, slide.headline || slide.altText || 'Hero Slide');
    sendSuccess(res, slide, 'Hero slide updated');
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await heroService.deleteHeroSlide(req.params.id);
    sendSuccess(res, null, 'Hero slide deleted');
  } catch (err) { next(err); }
}

export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slides = await heroService.reorderHeroSlides(req.body.items);
    sendSuccess(res, slides, 'Order updated');
  } catch (err) { next(err); }
}
