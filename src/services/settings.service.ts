import prisma from '../database/prisma';
import { uploadImage, replaceImage } from './cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../constants';

const SINGLETON_ID = 'singleton';

export async function getSettings() {
  const settings = await prisma.setting.findUnique({ where: { id: SINGLETON_ID } });
  if (!settings) {
    return prisma.setting.create({ data: { id: SINGLETON_ID, websiteName: 'Connect Digitals' } });
  }
  return settings;
}

export async function updateSettings(
  data: Partial<{
    websiteName: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    socialFacebook: string;
    socialInstagram: string;
    socialTwitter: string;
    socialLinkedin: string;
    socialWhatsapp: string;
    contactEmail: string;
    contactPhone: string;
  }>,
  logoBuffer?: Buffer,
  faviconBuffer?: Buffer
) {
  const existing = await getSettings();
  let update: any = { ...data };

  if (logoBuffer) {
    const uploaded = await replaceImage(logoBuffer, CLOUDINARY_FOLDERS.SETTINGS, existing.logoPublicId);
    update.logo = uploaded.url;
    update.logoPublicId = uploaded.publicId;
  }

  if (faviconBuffer) {
    const uploaded = await replaceImage(faviconBuffer, CLOUDINARY_FOLDERS.SETTINGS, existing.faviconPublicId);
    update.favicon = uploaded.url;
    update.faviconPublicId = uploaded.publicId;
  }

  return prisma.setting.update({ where: { id: SINGLETON_ID }, data: update });
}
