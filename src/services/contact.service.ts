import prisma from '../database/prisma';
import { parsePagination, parseSorting } from '../utils/pagination';

export async function getLeads(query: any) {
  const { page, limit, skip } = parsePagination(query);
  const { orderBy } = parseSorting(query, ['submittedAt', 'updatedAt', 'name', 'status'], 'submittedAt');

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { name:    { contains: query.search, mode: 'insensitive' } },
      { email:   { contains: query.search, mode: 'insensitive' } },
      { company: { contains: query.search, mode: 'insensitive' } },
      { service: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.contactLead.findMany({ where, skip, take: limit, orderBy }),
    prisma.contactLead.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getLeadById(id: string) {
  return prisma.contactLead.findUnique({ where: { id } });
}

export async function createLead(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
}) {
  return prisma.contactLead.create({ data });
}

export async function updateLeadStatus(id: string, status: string, notes?: string) {
  const existing = await prisma.contactLead.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });

  return prisma.contactLead.update({
    where: { id },
    data: {
      status,
      ...(notes !== undefined && { notes }),
    },
  });
}

export async function deleteLead(id: string) {
  const existing = await prisma.contactLead.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
  return prisma.contactLead.delete({ where: { id } });
}

export async function getLeadStats() {
  const [total, newLeads, contacted, negotiating, won, lost] = await prisma.$transaction([
    prisma.contactLead.count(),
    prisma.contactLead.count({ where: { status: 'new' } }),
    prisma.contactLead.count({ where: { status: 'contacted' } }),
    prisma.contactLead.count({ where: { status: 'negotiating' } }),
    prisma.contactLead.count({ where: { status: 'won' } }),
    prisma.contactLead.count({ where: { status: 'lost' } }),
  ]);
  return { total, new: newLeads, contacted, negotiating, won, lost };
}
