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
