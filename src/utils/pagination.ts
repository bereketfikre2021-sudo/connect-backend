import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants';

export function parsePagination(query: any): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(query.page as string) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit as string) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function parseSorting(
  query: any,
  allowedFields: string[],
  defaultField = 'displayOrder'
): { orderBy: Record<string, 'asc' | 'desc'> } {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
  return { orderBy: { [sortBy]: sortOrder } };
}
