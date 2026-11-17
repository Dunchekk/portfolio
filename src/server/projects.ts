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
      ...(category ? { categories: { some: { id: category } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' as const } },
              { summary: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    include: { categories: true, cover: true },
    orderBy,
  });
}
export async function saveProject(raw: unknown) {
  const input = projectSchema.parse(raw);
  return db().$transaction(async (tx) => {
    const data = {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      date: new Date(`${input.date}T00:00:00Z`),
      status: input.status,
      coverId: input.coverId,
      categories: { set: input.categoryIds.map((id) => ({ id })) },
    };
    let id = input.id;
    if (id) {
      const result = await tx.project.updateMany({
        where: { id, version: input.version },
        data: {
          title: data.title,
          slug: data.slug,
          summary: data.summary,
          date: data.date,
          status: data.status,
          coverId: data.coverId,
          version: { increment: 1 },
        },
      });
      if (result.count !== 1) throw new ConflictError();
      await tx.project.update({ where: { id }, data: { categories: data.categories } });
      await tx.projectBlock.deleteMany({ where: { projectId: id } });
    } else {
      const { categories: _categories, ...fields } = data;
      const project = await tx.project.create({
        data: { ...fields, categories: { connect: input.categoryIds.map((id) => ({ id })) } },
      });
      id = project.id;
    }
    await tx.projectBlock.createMany({
      data: orderedBlocks(input.blocks).map((block) => ({
        projectId: id!,
        column: block.column,
        position: block.position,
        kind: block.kind,
        ...(block.kind === 'TEXT'
          ? { text: block.text }
          : { mediaId: block.mediaId, alt: block.alt, caption: block.caption }),
      })),
    });
    return id;
  });
}
