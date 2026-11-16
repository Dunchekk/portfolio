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
