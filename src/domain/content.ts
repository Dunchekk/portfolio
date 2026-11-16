import { z } from 'zod';

export const statuses = ['DRAFT', 'LISTED', 'PUBLISHED'] as const;
export const textSchema = z.string().trim().max(100_000);
export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug: только a–z, цифры и дефисы.');
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Укажите существующую дату.');
const commonBlock = { column: z.number().int().min(0).max(2), id: z.string().optional() };
export const blockSchema = z.discriminatedUnion('kind', [
  z.object({ ...commonBlock, kind: z.literal('TEXT'), text: textSchema.min(1) }),
  z.object({
    ...commonBlock,
    kind: z.literal('IMAGE'),
    mediaId: z.string().min(1),
    alt: z.string().trim().min(1, 'Добавьте описание фотографии.').max(500),
    caption: z.string().max(1000),
  }),
]);
export const projectSchema = z
  .object({
    id: z.string().optional(),
    version: z.number().int().nonnegative(),
    title: z.string().trim().min(1).max(200),
    slug: slugSchema,
    summary: z.string().trim().max(500),
    date: dateSchema,
    status: z.enum(statuses),
    categoryIds: z.array(z.string()).max(30),
    coverId: z.string().nullable(),
    blocks: z.array(blockSchema).max(200),
  })
  .refine(
    (p) => p.status !== 'PUBLISHED' || p.blocks.length > 0,
    'Для публикации добавьте хотя бы один блок.',
  );
export type ProjectInput = z.infer<typeof projectSchema>;
export type BlockInput = z.infer<typeof blockSchema>;
