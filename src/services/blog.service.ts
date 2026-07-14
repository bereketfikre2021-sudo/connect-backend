import prisma from '../database/prisma';
import { uploadImage, replaceImage, deleteImage } from './cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../constants';
import { uniqueSlug } from '../utils/slugify';
import { parsePagination, parseSorting } from '../utils/pagination';

export async function getBlogPosts(query: any, adminView = false) {
  const { page, limit, skip } = parsePagination(query);
  const { orderBy } = parseSorting(query, ['publishedAt', 'createdAt', 'title', 'displayOrder'], 'createdAt');

  const where: any = {};
  if (!adminView) { where.published = true; where.status = 'published'; }
  if (query.status && adminView) where.status = query.status;
  if (query.category) where.category = { contains: query.category, mode: 'insensitive' };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.blogPost.findMany({ where, skip, take: limit, orderBy }),
    prisma.blogPost.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getBlogPostById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function createBlogPost(
  data: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    category?: string;
    tags?: string[];
    author?: string;
    readingTime?: number;
    status?: string;
    published?: boolean;
    publishedAt?: Date;
    scheduledAt?: Date;
    displayOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
  },
  imageBuffer?: Buffer
) {
  const slug = data.slug || await uniqueSlug(data.title, async (s) => {
    const e = await prisma.blogPost.findUnique({ where: { slug: s } });
    return !!e;
  });

  // Auto-calculate reading time if not provided
  const wordCount = data.content.split(/\s+/).length;
  const readingTime = data.readingTime || Math.ceil(wordCount / 200);

  let featuredImage: string | undefined;
  let imagePublicId: string | undefined;

  if (imageBuffer) {
    const uploaded = await uploadImage(imageBuffer, CLOUDINARY_FOLDERS.BLOG);
    featuredImage = uploaded.url;
    imagePublicId = uploaded.publicId;
  }

  const publishedAt = data.status === 'published' && !data.publishedAt ? new Date() : data.publishedAt;
  const published = data.status === 'published';

  return prisma.blogPost.create({
    data: {
      ...data,
      slug,
      readingTime,
      featuredImage,
      imagePublicId,
      publishedAt,
    },
  });
}

export async function updateBlogPost(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    author: string;
    readingTime: number;
    status: string;
    published: boolean;
    publishedAt: Date;
    scheduledAt: Date;
    displayOrder: number;
    seoTitle: string;
    seoDescription: string;
  }>,
  imageBuffer?: Buffer
) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Blog post not found'), { statusCode: 404 });

  let featuredImage = existing.featuredImage;
  let imagePublicId = existing.imagePublicId;

  if (imageBuffer) {
    const uploaded = await replaceImage(imageBuffer, CLOUDINARY_FOLDERS.BLOG, existing.imagePublicId);
    featuredImage = uploaded.url;
    imagePublicId = uploaded.publicId;
  }

  // Recalculate reading time if content changed
  let readingTime = data.readingTime;
  if (data.content && !data.readingTime) {
    readingTime = Math.ceil(data.content.split(/\s+/).length / 200);
  }

  // Set publishedAt when publishing for the first time
  let publishedAt = data.publishedAt;
  if (data.status === 'published' && !existing.publishedAt && !publishedAt) {
    publishedAt = new Date();
  }
  const published = data.status ? data.status === 'published' : existing.published;

  return prisma.blogPost.update({
    where: { id },
    data: { ...data, published, readingTime, featuredImage, imagePublicId, publishedAt },
  });
}

export async function deleteBlogPost(id: string) {
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Blog post not found'), { statusCode: 404 });

  if (existing.imagePublicId) {
    await deleteImage(existing.imagePublicId).catch(() => {});
  }

  return prisma.blogPost.delete({ where: { id } });
}
