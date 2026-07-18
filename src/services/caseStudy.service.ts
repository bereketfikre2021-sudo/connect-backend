import prisma from '../database/prisma';
import { uploadImage, replaceImage, deleteImage } from './cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../constants';
import { uniqueSlug } from '../utils/slugify';
import { parsePagination, parseSorting } from '../utils/pagination';

export async function getCaseStudies(query: any, adminView = false) {
  const { page, limit, skip } = parsePagination(query);
  const { orderBy } = parseSorting(query, ['displayOrder', 'createdAt', 'title']);

  const where: any = {};
  if (!adminView) where.published = true;
  if (query.published !== undefined && adminView) where.published = query.published === 'true';
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { client: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.caseStudy.findMany({ where, skip, take: limit, orderBy }),
    prisma.caseStudy.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getCaseStudyBySlug(slug: string) {
  return prisma.caseStudy.findUnique({ where: { slug } });
}

export async function getCaseStudyById(id: string) {
  return prisma.caseStudy.findUnique({ where: { id } });
}

export async function createCaseStudy(
  data: {
    title: string;
    slug?: string;
    client: string;
    industry?: string;
    overview?: string;
    challenge?: string[];
    research?: string;
    strategy?: string;
    designProcess?: string;
    solution?: string;
    role?: string[];
    results?: string;
    conclusion?: string;
    published?: boolean;
    displayOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
  },
  heroBuffer?: Buffer
) {
  const slug = data.slug || await uniqueSlug(data.title, async (s) => {
    const e = await prisma.caseStudy.findUnique({ where: { slug: s } });
    return !!e;
  });

  let heroImage = '';
  let heroPublicId: string | undefined;

  if (heroBuffer) {
    const uploaded = await uploadImage(heroBuffer, CLOUDINARY_FOLDERS.CASE_STUDIES);
    heroImage = uploaded.url;
    heroPublicId = uploaded.publicId;
  }

  return prisma.caseStudy.create({
    data: { ...data, slug, heroImage, heroPublicId },
  });
}

export async function updateCaseStudy(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    client: string;
    industry: string;
    overview: string;
    challenge: string[];
    research: string;
    strategy: string;
    designProcess: string;
    solution: string;
    role: string[];
    results: string;
    conclusion: string;
    published: boolean;
    displayOrder: number;
    seoTitle: string;
    seoDescription: string;
  }>,
  heroBuffer?: Buffer
) {
  const existing = await prisma.caseStudy.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Case study not found'), { statusCode: 404 });

  let heroImage = existing.heroImage;
  let heroPublicId = existing.heroPublicId;

  if (heroBuffer) {
    const uploaded = await replaceImage(heroBuffer, CLOUDINARY_FOLDERS.CASE_STUDIES, existing.heroPublicId);
    heroImage = uploaded.url;
    heroPublicId = uploaded.publicId;
  }

  return prisma.caseStudy.update({
    where: { id },
    data: { ...data, heroImage, heroPublicId },
  });
}

export async function deleteCaseStudy(id: string) {
  const existing = await prisma.caseStudy.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Case study not found'), { statusCode: 404 });

  const publicIds = [existing.heroPublicId, ...existing.galleryPublicIds].filter(Boolean) as string[];
  await Promise.allSettled(publicIds.map((pid) => deleteImage(pid)));

  return prisma.caseStudy.delete({ where: { id } });
}

export async function reorderCaseStudies(items: { id: string; displayOrder: number }[]) {
  const updates = items.map((item) =>
    prisma.caseStudy.update({ where: { id: item.id }, data: { displayOrder: item.displayOrder } })
  );
  return prisma.$transaction(updates);
}
