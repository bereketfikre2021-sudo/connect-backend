import crypto from 'crypto';
import { Request } from 'express';
import prisma from '../database/prisma';

// ── Bot detection ─────────────────────────────────────────────────
const BOT_PATTERN = /bot|crawler|spider|googlebot|bingbot|yandex|baidu|facebookexternalhit|curl|wget|python-requests|go-http-client|headlesschrome|phantomjs|slurp|duckduckbot|teoma|ia_archiver/i;

export function isBot(ua: string): boolean {
  return BOT_PATTERN.test(ua);
}

// ── UA Parsers ────────────────────────────────────────────────────
function parseDevice(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Other';
}

function parseOS(ua: string): string {
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function parseSource(referrer?: string): string {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (/google\./.test(host)) return 'google';
    if (/bing\.com/.test(host)) return 'bing';
    if (/facebook\.com|instagram\.com|twitter\.com|t\.co|tiktok\.com|linkedin\.com/.test(host)) return 'social';
    return 'referral';
  } catch {
    return 'direct';
  }
}

function getIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

// ── Visitor fingerprint ───────────────────────────────────────────
function fingerprint(ip: string, ua: string, lang: string): string {
  return crypto.createHash('sha256').update(`${ip}|${ua.toLowerCase()}|${lang}`).digest('hex');
}

// ── Record visit (called per request from middleware) ─────────────
export async function recordVisit(req: Request): Promise<{ visitorId: string; sessionId: string } | null> {
  try {
    const ua = req.headers['user-agent'] || '';
    if (isBot(ua)) return null;

    const ip = getIp(req);
    const lang = (req.headers['accept-language'] || '').split(',')[0].trim();
    const fp = fingerprint(ip, ua, lang);
    const referrer = req.headers.referer || req.headers.referrer as string || '';
    const source = parseSource(referrer);

    // Upsert visitor
    const visitor = await prisma.visitor.upsert({
      where: { fingerprint: fp },
      update: {
        lastSeen: new Date(),
        visits: { increment: 1 },
        ip,
      },
      create: {
        fingerprint: fp,
        ip,
        device: parseDevice(ua),
        browser: parseBrowser(ua),
        os: parseOS(ua),
        language: lang || null,
        referrer: referrer || null,
      } as any,
    });

    // Create session
    const session = await prisma.session.create({
      data: {
        visitorId: visitor.id,
        referrer: referrer || null,
        source,
      },
    });

    return { visitorId: visitor.id, sessionId: session.id };
  } catch {
    return null;
  }
}

// ── Record analytics event ────────────────────────────────────────
export async function recordEvent(
  visitorId: string | null,
  sessionId: string | null,
  type: string,
  name: string,
  value?: string,
  duration?: number,
  scrollPct?: number,
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        visitorId: visitorId || null,
        sessionId: sessionId || null,
        type,
        name,
        value: value || null,
        duration: duration || null,
        scrollPct: scrollPct || null,
      },
    });

    // Mark session as not bounced if there's real interaction
    if (sessionId && ['section_view', 'project_click', 'service_click', 'cta_click', 'contact_submit', 'cv_download'].includes(type)) {
      await prisma.session.updateMany({
        where: { id: sessionId, bounced: true },
        data: { bounced: false },
      });
    }
  } catch {
    // Never crash on analytics
  }
}

// ── End session ───────────────────────────────────────────────────
export async function endSession(sessionId: string, duration: number): Promise<void> {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { endedAt: new Date(), duration },
    });
  } catch {
    // ignore
  }
}

// ── Full analytics ────────────────────────────────────────────────
export async function getFullAnalytics() {
  const now = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeThreshold = new Date(now.getTime() - 5 * 60 * 1000); // 5 min

  const [
    totalVisitors,
    todayVisitors,
    weekVisitors,
    monthVisitors,
    returningVisitors,
    totalSessions,
    activeSessions,
    sessionsWithDuration,
    bounceCount,
    // Events
    sectionEvents,
    projectEvents,
    serviceEvents,
    conversionEvents,
    // Dimensions
    deviceGroups,
    browserGroups,
    countryGroups,
    sourceGroups,
    // Daily sparkline
    dailyRaw,
    // Recent visitors
    recentVisitors,
    // Recent events (live feed)
    recentEvents,
    // Blog stats
    topBlog,
  ] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.count({ where: { firstSeen: { gte: today } } }),
    prisma.visitor.count({ where: { firstSeen: { gte: thisWeek } } }),
    prisma.visitor.count({ where: { firstSeen: { gte: thisMonth } } }),
    prisma.visitor.count({ where: { visits: { gt: 1 } } }),
    prisma.session.count(),
    prisma.session.count({ where: { startedAt: { gte: activeThreshold }, endedAt: null } }),
    prisma.session.aggregate({ _avg: { duration: true }, where: { duration: { not: null } } }),
    prisma.session.count({ where: { bounced: true } }),
    // Section views
    prisma.analyticsEvent.groupBy({
      by: ['name'],
      where: { type: 'section_view' },
      _count: { id: true },
      _avg: { duration: true, scrollPct: true },
    }),
    // Project clicks
    prisma.analyticsEvent.groupBy({
      by: ['name'],
      where: { type: 'project_click' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    // Service clicks
    prisma.analyticsEvent.groupBy({
      by: ['name'],
      where: { type: 'service_click' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    // Conversions
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: { type: { in: ['contact_submit', 'cv_download', 'social_click', 'email_click', 'phone_click', 'cta_click', 'portfolio_click', 'external_click'] } },
      _count: { id: true },
    }),
    // Devices
    prisma.visitor.groupBy({ by: ['device'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    // Browsers
    prisma.visitor.groupBy({ by: ['browser'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    // Countries
    prisma.visitor.groupBy({ by: ['country'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10, where: { country: { not: null } } }),
    // Traffic sources
    prisma.session.groupBy({ by: ['source'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
    // Daily visitors (last 30 days)
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT DATE("first_seen")::text AS day, COUNT(*)::bigint AS count
      FROM visitors
      WHERE "first_seen" >= ${thisMonth}
      GROUP BY DATE("first_seen")
      ORDER BY day ASC
    `,
    // Recent visitors
    prisma.visitor.findMany({
      orderBy: { lastSeen: 'desc' },
      take: 10,
      select: { id: true, country: true, device: true, browser: true, os: true, lastSeen: true, visits: true },
    }),
    // Recent events
    prisma.analyticsEvent.findMany({
      orderBy: { recordedAt: 'desc' },
      take: 20,
      select: { type: true, name: true, value: true, recordedAt: true },
    }),
    // Top blog
    prisma.pageView.groupBy({
      by: ['slug'],
      where: { page: 'blog', slug: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ]);

  // Get recent session sources for recent visitors
  const avgDuration = Math.round(sessionsWithDuration._avg.duration || 0);
  const bounceRate = totalSessions > 0 ? Math.round((bounceCount / totalSessions) * 100) : 0;

  // Section analytics with unique visitor counts
  const sectionAnalytics = await Promise.all(
    sectionEvents.map(async (s) => {
      const unique = await prisma.analyticsEvent.findMany({
        where: { type: 'section_view', name: s.name },
        select: { visitorId: true },
        distinct: ['visitorId'],
      });
      return {
        section: s.name,
        views: s._count.id,
        uniqueViews: unique.length,
        avgDuration: Math.round(s._avg.duration || 0),
        avgScrollPct: Math.round(s._avg.scrollPct || 0),
      };
    })
  );

  // Conversion rates
  const conversionMap: Record<string, number> = {};
  for (const c of conversionEvents) conversionMap[c.type] = c._count.id;

  return {
    visitors: {
      total: totalVisitors,
      today: todayVisitors,
      thisWeek: weekVisitors,
      thisMonth: monthVisitors,
      returning: returningVisitors,
      returningPct: totalVisitors > 0 ? Math.round((returningVisitors / totalVisitors) * 100) : 0,
      active: activeSessions,
    },
    sessions: {
      total: totalSessions,
      active: activeSessions,
      avgDuration,
      bounceRate,
    },
    sections: sectionAnalytics,
    topProjects: projectEvents.map(p => ({ name: p.name, clicks: p._count.id })),
    topServices: serviceEvents.map(s => ({ name: s.name, clicks: s._count.id })),
    conversions: {
      contactForm:   conversionMap['contact_submit']  || 0,
      cvDownload:    conversionMap['cv_download']     || 0,
      socialClick:   conversionMap['social_click']    || 0,
      emailClick:    conversionMap['email_click']     || 0,
      phoneClick:    conversionMap['phone_click']     || 0,
      ctaClick:      conversionMap['cta_click']       || 0,
      portfolioClick: conversionMap['portfolio_click'] || 0,
      externalClick: conversionMap['external_click']  || 0,
    },
    devices:  deviceGroups.map(d => ({ name: d.device || 'unknown', count: d._count.id })),
    browsers: browserGroups.map(b => ({ name: b.browser || 'unknown', count: b._count.id })),
    countries: countryGroups.map(c => ({ name: c.country || 'unknown', count: c._count.id })),
    sources: sourceGroups.map(s => ({ name: s.source || 'direct', count: s._count.id })),
    daily: dailyRaw.map(r => ({ day: r.day, count: Number(r.count) })),
    recentVisitors,
    recentEvents,
    topBlog: topBlog.map(b => ({ slug: b.slug, views: b._count.id })),
  };
}

// ── Live analytics ────────────────────────────────────────────────
export async function getLiveAnalytics() {
  const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);
  const [activeCount, latestVisitor, recentEvents] = await Promise.all([
    prisma.session.count({ where: { startedAt: { gte: activeThreshold }, endedAt: null } }),
    prisma.visitor.findFirst({ orderBy: { lastSeen: 'desc' }, select: { country: true, device: true, browser: true, lastSeen: true } }),
    prisma.analyticsEvent.findMany({
      orderBy: { recordedAt: 'desc' },
      take: 10,
      select: { type: true, name: true, recordedAt: true },
    }),
  ]);
  return { activeVisitors: activeCount, latestVisitor, recentEvents };
}

// ── Legacy functions (kept for backward compat) ───────────────────
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

  const [totalViews, viewsLast30, viewsLast7, totalLeads, newLeads] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { viewedAt: { gte: last30 } } }),
    prisma.pageView.count({ where: { viewedAt: { gte: last7 } } }),
    prisma.contactLead.count(),
    prisma.contactLead.count({ where: { status: 'new' } }),
  ]);

  const byPageRaw = await prisma.pageView.groupBy({
    by: ['page'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  const pageMap: Record<string, number> = {};
  for (const row of byPageRaw) pageMap[row.page] = row._count.id;

  const [topPortfolioRaw, topBlogRaw, topCaseStudyRaw] = await Promise.all([
    prisma.pageView.groupBy({ by: ['slug'], where: { page: 'portfolio', slug: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
    prisma.pageView.groupBy({ by: ['slug'], where: { page: 'blog', slug: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
    prisma.pageView.groupBy({ by: ['slug'], where: { page: 'case-studies', slug: { not: null } }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
  ]);

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
    topPortfolio:  topPortfolioRaw.map(r => ({ slug: r.slug, views: r._count.id })),
    topBlog:       topBlogRaw.map(r => ({ slug: r.slug, views: r._count.id })),
    topCaseStudy:  topCaseStudyRaw.map(r => ({ slug: r.slug, views: r._count.id })),
    daily:         dailyRaw.map(r => ({ day: r.day, count: Number(r.count) })),
  };
}
