import { z } from 'zod';

export const statuses = ['DRAFT', 'LISTED', 'PUBLISHED'] as const;
export const textSchema = z.string().trim().max(100_000);
export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug: только a–z, цифры и дефисы.');
