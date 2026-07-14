import prisma from '../database/prisma';

export async function recordView(page: string, slug?: string, referrer?: string) {
  try {
    await prisma.pageView.create({
      data: { page, slug: slug || null, referrer: referrer || null },
    });
  } catch {
    // Never let analytics crash the main request
  }
}

export async function getAnalytics() {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000);

  // Run counts in parallel
  const [totalViews, viewsLast30, viewsLast7, totalLeads, newLeads] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { viewedAt: { gte: last30 } } }),
    prisma.pageView.count({ where: { viewedAt: { gte: last7 } } }),
    prisma.contactLead.count(),
    prisma.contactLead.count({ where: { status: 'new' } }),
  ]);

  // Views by page
  const byPageRaw = await prisma.pageView.groupBy({
    by: ['page'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  const pageMap: Record<string, number> = {};
  for (const row of byPageRaw) pageMap[row.page] = row._count.id;

  // Top content by slug
  const [topPortfolioRaw, topBlogRaw, topCaseStudyRaw] = await Promise.all([
    prisma.pageView.groupBy({
      by: ['slug'],
      where: { page: 'portfolio', slug: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.pageView.groupBy({
      by: ['slug'],
      where: { page: 'blog', slug: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.pageView.groupBy({
      by: ['slug'],
      where: { page: 'case-studies', slug: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ]);

  // Daily sparkline via raw SQL — outside transaction to avoid type conflicts
  type DailyRow = { day: string; count: bigint };
  const dailyRaw = await prisma.$queryRaw<DailyRow[]>`
    SELECT DATE("viewed_at")::text AS day, COUNT(*)::bigint AS count
    FROM page_views
    WHERE "viewed_at" >= ${last30}
    GROUP BY DATE("viewed_at")
    ORDER BY day ASC
  `;

  return {
    totals: { allTime: totalViews, last30: viewsLast30, last7: viewsLast7 },
    byPage: {
      home:        pageMap['home']         || 0,
      portfolio:   pageMap['portfolio']    || 0,
      blog:        pageMap['blog']         || 0,
      caseStudies: pageMap['case-studies'] || 0,
      contact:     pageMap['contact']      || 0,
    },
    leads: { total: totalLeads, new: newLeads },
    topPortfolio:  topPortfolioRaw.map((r)  => ({ slug: r.slug,  views: r._count.id })),
    topBlog:       topBlogRaw.map((r)       => ({ slug: r.slug,  views: r._count.id })),
    topCaseStudy:  topCaseStudyRaw.map((r)  => ({ slug: r.slug,  views: r._count.id })),
    daily:         dailyRaw.map((r)         => ({ day: r.day,    count: Number(r.count) })),
  };
}
