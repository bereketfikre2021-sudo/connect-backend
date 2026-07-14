import prisma from '../database/prisma';
import { uploadImage, replaceImage, deleteImage } from './cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../constants';

export async function getAllHeroSlides(publishedOnly = false) {
  return prisma.heroSlide.findMany({
    where: publishedOnly ? { status: 'active' } : undefined,
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getHeroSlideById(id: string) {
  return prisma.heroSlide.findUnique({ where: { id } });
}

export async function createHeroSlide(
  data: {
    headline?: string;
    subheadline?: string;
    buttonText?: string;
    buttonUrl?: string;
    altText?: string;
    autoSlideDelay?: number;
    displayOrder?: number;
    status?: string;
    published?: boolean;
  },
  imageBuffer?: Buffer
) {
  let backgroundImage = '';
  let imagePublicId: string | undefined;

  if (imageBuffer) {
    const uploaded = await uploadImage(imageBuffer, CLOUDINARY_FOLDERS.HERO);
    backgroundImage = uploaded.url;
    imagePublicId = uploaded.publicId;
  }

  const status = data.status || (data.published === false ? 'inactive' : 'active');
  const published = status === 'active';

  // Destructure out status/published so the spread doesn't overwrite computed values
  const { status: _s, published: _p, ...rest } = data;

  return prisma.heroSlide.create({
    data: { backgroundImage, imagePublicId, ...rest, status, published },
  });
}

export async function updateHeroSlide(
  id: string,
  data: Partial<{
    headline: string;
    subheadline: string;
    buttonText: string;
    buttonUrl: string;
    altText: string;
    autoSlideDelay: number;
    displayOrder: number;
    status: string;
    published: boolean;
  }>,
  imageBuffer?: Buffer
) {
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Hero slide not found'), { statusCode: 404 });

  let backgroundImage = existing.backgroundImage;
  let imagePublicId = existing.imagePublicId;

  if (imageBuffer) {
    const uploaded = await replaceImage(imageBuffer, CLOUDINARY_FOLDERS.HERO, existing.imagePublicId);
    backgroundImage = uploaded.url;
    imagePublicId = uploaded.publicId;
  }

  // Compute status/published consistency — controller already coerced, just ensure both are set
  let status = data.status ?? existing.status;
  let published: boolean;
  if (data.status) {
    published = data.status === 'active';
  } else if (data.published !== undefined) {
    published = data.published;
    status = published ? 'active' : 'inactive';
  } else {
    published = existing.published;
    status = existing.status;
  }

  const { status: _s, published: _p, ...rest } = data;

  return prisma.heroSlide.update({
    where: { id },
    data: { ...rest, status, published, backgroundImage, imagePublicId },
  });
}

export async function deleteHeroSlide(id: string) {
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Hero slide not found'), { statusCode: 404 });

  if (existing.imagePublicId) {
    await deleteImage(existing.imagePublicId).catch(() => {});
  }

  return prisma.heroSlide.delete({ where: { id } });
}

export async function reorderHeroSlides(items: { id: string; displayOrder: number }[]) {
  const updates = items.map((item) =>
    prisma.heroSlide.update({
      where: { id: item.id },
      data: { displayOrder: item.displayOrder },
    })
  );
  return prisma.$transaction(updates);
}
