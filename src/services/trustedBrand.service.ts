import prisma from '../database/prisma';
import { uploadImage, replaceImage, deleteImage } from './cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../constants';

export async function getTrustedBrands(publishedOnly = false) {
  return prisma.trustedBrand.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getTrustedBrandById(id: string) {
  return prisma.trustedBrand.findUnique({ where: { id } });
}

export async function createTrustedBrand(
  data: {
    name: string;
    website?: string;
    altText?: string;
    displayOrder?: number;
    published?: boolean;
  },
  logoBuffer?: Buffer
) {
  let logo = '';
  let logoPublicId: string | undefined;

  if (logoBuffer) {
    const uploaded = await uploadImage(logoBuffer, CLOUDINARY_FOLDERS.TRUSTED_BRANDS);
    logo = uploaded.url;
    logoPublicId = uploaded.publicId;
  }

  return prisma.trustedBrand.create({ data: { ...data, logo, logoPublicId } });
}

export async function updateTrustedBrand(
  id: string,
  data: Partial<{
    name: string;
    website: string;
    altText: string;
    displayOrder: number;
    published: boolean;
  }>,
  logoBuffer?: Buffer
) {
  const existing = await prisma.trustedBrand.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Brand not found'), { statusCode: 404 });

  let logo = existing.logo;
  let logoPublicId = existing.logoPublicId;

  if (logoBuffer) {
    const uploaded = await replaceImage(logoBuffer, CLOUDINARY_FOLDERS.TRUSTED_BRANDS, existing.logoPublicId);
    logo = uploaded.url;
    logoPublicId = uploaded.publicId;
  }

  return prisma.trustedBrand.update({ where: { id }, data: { ...data, logo, logoPublicId } });
}

export async function deleteTrustedBrand(id: string) {
  const existing = await prisma.trustedBrand.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Brand not found'), { statusCode: 404 });

  if (existing.logoPublicId) await deleteImage(existing.logoPublicId).catch(() => {});

  return prisma.trustedBrand.delete({ where: { id } });
}

export async function reorderTrustedBrands(items: { id: string; displayOrder: number }[]) {
  const updates = items.map((item) =>
    prisma.trustedBrand.update({ where: { id: item.id }, data: { displayOrder: item.displayOrder } })
  );
  return prisma.$transaction(updates);
}
