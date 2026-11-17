import 'server-only';
import { z } from 'zod';
import { db } from './db';
import { ConflictError, normalizeText, textSchema } from '@/domain/content';
export async function getProfile() {
  return (
    (await db().profile.findUnique({ where: { id: 'main' } })) ?? {
      id: 'main',
      name: 'Portfolio',
      about: '',
      contact: '',
      version: 0,
    }
  );
}
export async function saveProfile(raw: unknown) {
  const input = z
    .object({
      name: z.string().trim().min(1).max(120),
      about: textSchema,
      contact: textSchema,
      version: z.number().int().nonnegative(),
    })
    .parse(raw);
  const data = {
    name: input.name,
    about: normalizeText(input.about),
    contact: normalizeText(input.contact),
  };
  if (input.version === 0) return db().profile.create({ data: { id: 'main', ...data } });
  const result = await db().profile.updateMany({
    where: { id: 'main', version: input.version },
    data: { ...data, version: { increment: 1 } },
  });
  if (result.count !== 1) throw new ConflictError();
}
