import prisma from '../database/prisma';

export type ActivityAction = 'created' | 'updated' | 'published' | 'deleted';
export type ActivityEntity =
  | 'portfolio'
  | 'blog'
  | 'hero'
  | 'case-study'
  | 'testimonial'
  | 'trusted-brand'
  | 'settings'
  | 'lead';

export async function logActivity(
  action: ActivityAction,
  entity: ActivityEntity,
  entityId: string,
  title: string
): Promise<void> {
  try {
    await prisma.activityLog.create({ data: { action, entity, entityId, title } });
    // Keep only last 100 entries to avoid unbounded growth
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (logs.length > 100) {
      const toDelete = logs.slice(100).map((l) => l.id);
      await prisma.activityLog.deleteMany({ where: { id: { in: toDelete } } });
    }
  } catch {
    // Never let logging crash the main request
  }
}
