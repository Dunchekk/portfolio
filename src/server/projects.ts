import 'server-only';
import { db } from './db';
import { orderedBlocks, projectSchema, ConflictError } from '@/domain/content';
import { Prisma } from '@/generated/prisma/client';

const include = {
  categories: true,
  cover: true,
  blocks: { orderBy: [{ column: 'asc' }, { position: 'asc' }], include: { media: true } },
} satisfies Prisma.ProjectInclude;
export type ProjectRecord = Prisma.ProjectGetPayload<{ include: typeof include }>;
export const getProject = (id: string) => db().project.findUnique({ where: { id }, include });
export const getPublishedProject = (slug: string) =>
  db().project.findFirst({ where: { slug, status: 'PUBLISHED' }, include });
export const getCategories = () => db().category.findMany({ orderBy: { name: 'asc' } });
export async function listProjects({
  admin = false,
  q = '',
  category = '',
  sort = 'date-desc',
}: { admin?: boolean; q?: string; category?: string; sort?: string } = {}) {
  const orderBy: Prisma.ProjectOrderByWithRelationInput[] =
    sort === 'title-asc'
      ? [{ title: 'asc' }, { id: 'asc' }]
      : sort === 'title-desc'
        ? [{ title: 'desc' }, { id: 'asc' }]
        : [{ date: sort === 'date-asc' ? 'asc' : 'desc' }, { id: 'asc' }];
  return db().project.findMany({
    where: {
      ...(!admin ? { status: { in: ['LISTED', 'PUBLISHED'] as const } } : {}),
    },
    include: { categories: true, cover: true },
    orderBy,
  });
}
