import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { config } from '../config/env';
import logger from '../utils/logger';

let client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (!client) {
    client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: config.ga4.clientEmail,
        private_key:  config.ga4.privateKey,
      },
    });
  }
  return client;
}

const PROPERTY = `properties/${config.ga4.propertyId}`;

// ── Helper: safely extract row value ────────────────────────────
function dimVal(row: any, idx = 0): string {
  return row?.dimensionValues?.[idx]?.value ?? '(not set)';
}
function metVal(row: any, idx = 0): number {
  return parseInt(row?.metricValues?.[idx]?.value ?? '0', 10);
}

// ── Main report ──────────────────────────────────────────────────
export async function getGA4Report() {
  const ga = getClient();

  try {
    // Run all reports in parallel
    const [
      overviewRes,
      dailyRes,
      topPagesRes,
      trafficSourceRes,
      countryRes,
      deviceRes,
      browserRes,
    ] = await Promise.all([

      // Overview: today / this week / this month + page views + sessions + bounce rate
      ga.runReport({
        property: PROPERTY,
        dateRanges: [
          { startDate: 'today',     endDate: 'today',     name: 'today'     },
          { startDate: '7daysAgo',  endDate: 'today',     name: 'week'      },
          { startDate: '30daysAgo', endDate: 'today',     name: 'month'     },
        ],
        metrics: [
          { name: 'activeUsers'       },
          { name: 'screenPageViews'   },
          { name: 'sessions'          },
          { name: 'bounceRate'        },
          { name: 'averageSessionDuration' },
        ],
      }),

      // Daily page views (last 30 days)
      ga.runReport({
        property: PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics:    [{ name: 'screenPageViews' }],
        orderBys:   [{ dimension: { dimensionName: 'date' } }],
      }),

      // Top pages
      ga.runReport({
        property: PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics:    [{ name: 'screenPageViews' }],
        orderBys:   [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),

      // Traffic sources
      ga.runReport({
        property: PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics:    [{ name: 'sessions' }],
        orderBys:   [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),

      // Countries
      ga.runReport({
        property: PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics:    [{ name: 'activeUsers' }],
        orderBys:   [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 8,
      }),

      // Devices
      ga.runReport({
        property: PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics:    [{ name: 'sessions' }],
        orderBys:   [{ metric: { metricName: 'sessions' }, desc: true }],
      }),

      // Browsers
      ga.runReport({
        property: PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'browser' }],
        metrics:    [{ name: 'sessions' }],
        orderBys:   [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 6,
      }),
    ]);

    // ── Parse overview (one row per date range) ──────────────────
    const parseOverview = (rows: any[], rangeIdx: number) => {
      const row = rows?.find((_: any, i: number) => i === rangeIdx) ?? rows?.[0];
      return {
        users:           metVal(row, 0),
        pageViews:       metVal(row, 1),
        sessions:        metVal(row, 2),
        bounceRate:      parseFloat(row?.metricValues?.[3]?.value ?? '0'),
        avgSessionDuration: parseFloat(row?.metricValues?.[4]?.value ?? '0'),
      };
    };

    const ovRows = overviewRes[0]?.rows ?? [];
    const today  = parseOverview(ovRows, 0);
    const week   = parseOverview(ovRows, 1);
    const month  = parseOverview(ovRows, 2);

    // ── Daily sparkline ──────────────────────────────────────────
    const daily = (dailyRes[0]?.rows ?? []).map((r: any) => ({
      date:  dimVal(r, 0), // YYYYMMDD
      views: metVal(r, 0),
    }));

    // ── Top pages ────────────────────────────────────────────────
    const topPages = (topPagesRes[0]?.rows ?? []).map((r: any) => ({
      path:  dimVal(r, 0),
      views: metVal(r, 0),
    }));

    // ── Traffic sources ──────────────────────────────────────────
    const trafficSources = (trafficSourceRes[0]?.rows ?? []).map((r: any) => ({
      source:   dimVal(r, 0),
      sessions: metVal(r, 0),
    }));

    // ── Countries ────────────────────────────────────────────────
    const countries = (countryRes[0]?.rows ?? []).map((r: any) => ({
      country: dimVal(r, 0),
      users:   metVal(r, 0),
    }));

    // ── Devices ──────────────────────────────────────────────────
    const devices = (deviceRes[0]?.rows ?? []).map((r: any) => ({
      device:   dimVal(r, 0),
      sessions: metVal(r, 0),
    }));

    // ── Browsers ─────────────────────────────────────────────────
    const browsers = (browserRes[0]?.rows ?? []).map((r: any) => ({
      browser:  dimVal(r, 0),
      sessions: metVal(r, 0),
    }));

    return { today, week, month, daily, topPages, trafficSources, countries, devices, browsers };

  } catch (err: any) {
    logger.error('GA4 API error: ' + (err?.message ?? err));
    throw err;
  }
}
