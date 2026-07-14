import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';
import { sendSuccess } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function get(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await settingsService.getSettings();
    sendSuccess(res, settings);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const files = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const logoBuffer = files?.logo?.[0]?.buffer;
    const faviconBuffer = files?.favicon?.[0]?.buffer;

    // Whitelist only updatable fields — prevents Prisma errors from extra fields
    // (id, createdAt, updatedAt, logo, logoPublicId, favicon, faviconPublicId are managed internally)
    const {
      websiteName, seoTitle, seoDescription, seoKeywords,
      socialFacebook, socialInstagram, socialTwitter, socialLinkedin, socialWhatsapp,
      contactEmail, contactPhone, tagline, slogan,
      statProjects, statSatisfaction, statExperience,
    } = req.body;

    const data = {
      ...(websiteName !== undefined && { websiteName }),
      ...(seoTitle !== undefined && { seoTitle }),
      ...(seoDescription !== undefined && { seoDescription }),
      ...(seoKeywords !== undefined && { seoKeywords }),
      ...(socialFacebook !== undefined && { socialFacebook }),
      ...(socialInstagram !== undefined && { socialInstagram }),
      ...(socialTwitter !== undefined && { socialTwitter }),
      ...(socialLinkedin !== undefined && { socialLinkedin }),
      ...(socialWhatsapp !== undefined && { socialWhatsapp }),
      ...(contactEmail !== undefined && { contactEmail }),
      ...(contactPhone !== undefined && { contactPhone }),
      ...(tagline !== undefined && { tagline }),
      ...(slogan !== undefined && { slogan }),
      ...(statProjects !== undefined && { statProjects: parseInt(statProjects, 10) || 150 }),
      ...(statSatisfaction !== undefined && { statSatisfaction: parseInt(statSatisfaction, 10) || 98 }),
      ...(statExperience !== undefined && { statExperience: parseInt(statExperience, 10) || 5 }),
    };

    const settings = await settingsService.updateSettings(data, logoBuffer, faviconBuffer);
    await logActivity('updated', 'settings', settings.id, 'Site Settings');
    sendSuccess(res, settings, 'Settings updated');
  } catch (err) { next(err); }
}
