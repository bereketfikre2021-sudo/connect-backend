import prisma from '../database/prisma';
import { uploadImage, replaceImage, deleteImage } from './cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../constants';

export async function getTestimonials(publishedOnly = false, featuredOnly = false) {
  const where: any = {};
  if (publishedOnly) where.published = true;
  if (featuredOnly) where.featured = true;
  return prisma.testimonial.findMany({ where, orderBy: { displayOrder: 'asc' } });
}

export async function getTestimonialById(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export async function createTestimonial(
  data: {
    clientName: string;
    position?: string;
    company?: string;
    review: string;
    rating?: number;
    href?: string;
    featured?: boolean;
    displayOrder?: number;
    published?: boolean;
  },
  photoBuffer?: Buffer
) {
  let clientPhoto: string | undefined;
  let photoPublicId: string | undefined;

  if (photoBuffer) {
    const uploaded = await uploadImage(photoBuffer, CLOUDINARY_FOLDERS.TESTIMONIALS);
    clientPhoto = uploaded.url;
    photoPublicId = uploaded.publicId;
  }

  return prisma.testimonial.create({ data: { ...data, clientPhoto, photoPublicId } });
}

export async function updateTestimonial(
  id: string,
  data: Partial<{
    clientName: string;
    position: string;
    company: string;
    review: string;
    rating: number;
    href: string;
    featured: boolean;
    displayOrder: number;
    published: boolean;
  }>,
  photoBuffer?: Buffer
) {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Testimonial not found'), { statusCode: 404 });

  let clientPhoto = existing.clientPhoto;
  let photoPublicId = existing.photoPublicId;

  if (photoBuffer) {
    const uploaded = await replaceImage(photoBuffer, CLOUDINARY_FOLDERS.TESTIMONIALS, existing.photoPublicId);
    clientPhoto = uploaded.url;
    photoPublicId = uploaded.publicId;
  }

  return prisma.testimonial.update({ where: { id }, data: { ...data, clientPhoto, photoPublicId } });
}

export async function deleteTestimonial(id: string) {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Testimonial not found'), { statusCode: 404 });

  if (existing.photoPublicId) await deleteImage(existing.photoPublicId).catch(() => {});

  return prisma.testimonial.delete({ where: { id } });
}

export async function reorderTestimonials(items: { id: string; displayOrder: number }[]) {
  const updates = items.map((item) =>
    prisma.testimonial.update({ where: { id: item.id }, data: { displayOrder: item.displayOrder } })
  );
  return prisma.$transaction(updates);
}
