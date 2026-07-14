import { Request, Response, NextFunction } from 'express';
import * as brandService from '../services/trustedBrand.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isPublic = !(req as AuthRequest).admin;
    const brands = await brandService.getTrustedBrands(isPublic);
    sendSuccess(res, brands);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brand = await brandService.getTrustedBrandById(req.params.id);
    if (!brand) { sendNotFound(res, 'Brand'); return; }
    sendSuccess(res, brand);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;
    const brand = await brandService.createTrustedBrand(data, file?.buffer);
    await logActivity('created', 'trusted-brand', brand.id, brand.name);
    sendCreated(res, brand, 'Brand created');
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (data.published !== undefined) data.published = data.published === true || data.published === 'true' || data.published === 'on';
    if (data.displayOrder !== undefined) data.displayOrder = parseInt(data.displayOrder, 10) || 0;
    const brand = await brandService.updateTrustedBrand(req.params.id, data, file?.buffer);
    await logActivity('updated', 'trusted-brand', brand.id, brand.name);
    sendSuccess(res, brand, 'Brand updated');
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await brandService.deleteTrustedBrand(req.params.id);
    sendSuccess(res, null, 'Brand deleted');
  } catch (err) { next(err); }
}

export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const brands = await brandService.reorderTrustedBrands(req.body.items);
    sendSuccess(res, brands, 'Order updated');
  } catch (err) { next(err); }
}
