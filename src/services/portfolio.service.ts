import prisma from '../database/prisma';
import { uploadImage, replaceImage, deleteImage } from './cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../constants';
import { uniqueSlug } from '../utils/slugify';
import { parsePagination, parseSorting } from '../utils/pagination';

export async function getPortfolioProjects(query: any, adminView = false) {
  const { page, limit, skip } = parsePagination(query);
  const { orderBy } = parseSorting(query, ['displayOrder', 'createdAt', 'title', 'year']);

  const where: any = {};
  if (!adminView) where.status = 'published';
  if (query.status && adminView) where.status = query.status;
  if (query.category) where.category = query.category;
  if (query.featured === 'true') where.featured = true;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { client: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.portfolioProject.findMany({ where, skip, take: limit, orderBy }),
    prisma.portfolioProject.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getPortfolioBySlug(slug: string) {
  return prisma.portfolioProject.findUnique({ where: { slug } });
}

export async function getPortfolioById(id: string) {
  return prisma.portfolioProject.findUnique({ where: { id } });
}

export async function createPortfolioProject(
  data: {
    title: string;
    slug?: string;
    category: string;
    client?: string;
    industry?: string;
    year?: number;
    shortDescription?: string;
    fullDescription?: string;
    servicesProvided?: string[];
    technologies?: string[];
    projectUrl?: string;
    altText?: string;
    caseStudyChallenge?: string;
    caseStudySolution?: string;
    caseStudyResults?: any;
    featured?: boolean;
    status?: string;
    published?: boolean;
    displayOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
  },
  thumbnailBuffer?: Buffer,
  galleryBuffers?: Buffer[]
) {
  const slug = data.slug || await uniqueSlug(data.title, async (s) => {
    const existing = await prisma.portfolioProject.findUnique({ where: { slug: s } });
    return !!existing;
  });

  const status = data.status || (data.published === false ? 'draft' : 'published');
  const published = status === 'published';

  let thumbnail = '';
  let thumbnailPublicId: string | undefined;
  const gallery: string[] = [];
  const galleryPublicIds: string[] = [];

  if (thumbnailBuffer) {
    const uploaded = await uploadImage(thumbnailBuffer, CLOUDINARY_FOLDERS.PORTFOLIO);
    thumbnail = uploaded.url;
    thumbnailPublicId = uploaded.publicId;
  }

  if (galleryBuffers?.length) {
    for (const buf of galleryBuffers) {
      const uploaded = await uploadImage(buf, CLOUDINARY_FOLDERS.PORTFOLIO);
      gallery.push(uploaded.url);
      galleryPublicIds.push(uploaded.publicId);
    }
  }

  return prisma.portfolioProject.create({
    data: { ...data, slug, status, published, thumbnail, thumbnailPublicId, gallery, galleryPublicIds },
  });
}

export async function updatePortfolioProject(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    category: string;
    client: string;
    industry: string;
    year: number;
    shortDescription: string;
    fullDescription: string;
    servicesProvided: string[];
    technologies: string[];
    projectUrl: string;
    altText: string;
    caseStudyChallenge: string;
    caseStudySolution: string;
    caseStudyResults: any;
    featured: boolean;
    status: string;
    published: boolean;
    displayOrder: number;
    seoTitle: string;
    seoDescription: string;
  }>,
  thumbnailBuffer?: Buffer
) {
  const existing = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Project not found'), { statusCode: 404 });

  let thumbnail = existing.thumbnail;
  let thumbnailPublicId = existing.thumbnailPublicId;

  if (thumbnailBuffer) {
    const uploaded = await replaceImage(
      thumbnailBuffer,
      CLOUDINARY_FOLDERS.PORTFOLIO,
      existing.thumbnailPublicId
    );
    thumbnail = uploaded.url;
    thumbnailPublicId = uploaded.publicId;
  }

  // Compute status/published consistency — strip from data to avoid overwrite
  const { status: rawStatus, published: rawPublished, ...rest } = data as any;
  let status: string;
  let published: boolean;
  if (rawStatus) {
    status = rawStatus;
    published = rawStatus === 'published';
  } else if (rawPublished !== undefined) {
    published = rawPublished;
    status = rawPublished ? 'published' : 'draft';
  } else {
    status = existing.status;
    published = existing.published;
  }

  return prisma.portfolioProject.update({
    where: { id },
    data: { ...rest, status, published, thumbnail, thumbnailPublicId },
  });
}

export async function deletePortfolioProject(id: string) {
  const existing = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Project not found'), { statusCode: 404 });

  // Delete all Cloudinary images
  const publicIds = [existing.thumbnailPublicId, ...existing.galleryPublicIds].filter(Boolean) as string[];
  await Promise.allSettled(publicIds.map((pid) => deleteImage(pid)));

  return prisma.portfolioProject.delete({ where: { id } });
}

export async function reorderPortfolioProjects(items: { id: string; displayOrder: number }[]) {
  const updates = items.map((item) =>
    prisma.portfolioProject.update({ where: { id: item.id }, data: { displayOrder: item.displayOrder } })
  );
  return prisma.$transaction(updates);
}
