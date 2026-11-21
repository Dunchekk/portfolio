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
