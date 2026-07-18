import { Router, Request, Response } from 'express';
import prisma from '../database/prisma';
import { config } from '../config/env';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────
const esc = (s: string) =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&apos;');

function urlEntry(loc: string, lastmod?: string, priority = '0.7', changefreq = 'monthly') {
  return [
    '  <url>',
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

function isoDate(d: Date | string) {
  return new Date(d).toISOString().split('T')[0];
}

// ── /sitemap.xml ─────────────────────────────────────────────────
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const base = config.siteUrl.replace(/\/$/, '');
    const now = isoDate(new Date());

    // Static pages — ordered by priority
    const staticPages = [
      { path: '/',         priority: '1.0', changefreq: 'weekly'  },
      { path: '/#about',   priority: '0.8', changefreq: 'monthly' },
      { path: '/#services',priority: '0.8', changefreq: 'monthly' },
      { path: '/#portfolio',priority:'0.9', changefreq: 'weekly'  },
      { path: '/#blog',    priority: '0.8', changefreq: 'weekly'  },
      { path: '/#contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/#faq',     priority: '0.6', changefreq: 'monthly' },
    ];

    // Dynamic content — published only
    const [blogPosts, portfolioProjects] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true, status: 'published' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.portfolioProject.findMany({
        where: { published: true, status: 'published' },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const entries = [
      // Static
      ...staticPages.map(p =>
        urlEntry(`${base}${p.path}`, now, p.priority, p.changefreq)
      ),
      // Blog posts
      ...blogPosts.map(p =>
        urlEntry(
          `${base}/blog/${esc(p.slug)}`,
          isoDate(p.updatedAt),
          '0.7',
          'monthly'
        )
      ),
      // Portfolio projects
      ...portfolioProjects.map(p =>
        urlEntry(
          `${base}/portfolio/${esc(p.slug)}`,
          isoDate(p.updatedAt),
          '0.8',
          'monthly'
        )
      ),
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
      '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
      '          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
      ...entries,
      '</urlset>',
    ].join('\n');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1h
    res.send(xml);
  } catch (err: any) {
    res.status(500).send('<?xml version="1.0"?><error>Failed to generate sitemap</error>');
  }
});

// ── /robots.txt ───────────────────────────────────────────────────
router.get('/robots.txt', (_req: Request, res: Response) => {
  const base = config.siteUrl.replace(/\/$/, '');

  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Block admin and private areas',
    'Disallow: /admin',
    'Disallow: /dashboard',
    'Disallow: /login',
    'Disallow: /api/',
    'Disallow: /uploads/temp',
    '',
    `Sitemap: ${base}/sitemap.xml`,
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h
  res.send(content);
});

export default router;
