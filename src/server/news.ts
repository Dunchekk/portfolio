import 'server-only';
import { z } from 'zod';
import { db } from './db';
import { dateSchema, textSchema, normalizeText, ConflictError } from '@/domain/content';
const newsSchema = z.object({
  id: z.string().optional(),
  version: z.number().int().nonnegative(),
  title: z.string().trim().min(1).max(200),
  text: textSchema.min(1),
  date: dateSchema,
  published: z.boolean(),
  mediaId: z.string().nullable(),
});
export const listNews = (admin = false) =>
  db().news.findMany({
    where: admin ? {} : { published: true },
    orderBy: [{ date: 'desc' }, { id: 'asc' }],
    include: { media: true },
  });
export async function saveNews(raw: unknown) {
  const input = newsSchema.parse(raw);
  const data = {
    title: input.title,
    text: normalizeText(input.text),
    date: new Date(`${input.date}T00:00:00Z`),
    published: input.published,
    mediaId: input.mediaId,
  };
  if (!input.id) return db().news.create({ data });
  const result = await db().news.updateMany({
    where: { id: input.id, version: input.version },
    data: { ...data, version: { increment: 1 } },
  });
  if (result.count !== 1) throw new ConflictError();
}
