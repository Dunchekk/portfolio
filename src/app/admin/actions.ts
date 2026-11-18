'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin, signIn, signOut } from '@/server/auth';
import { saveProject } from '@/server/projects';
import { saveProfile } from '@/server/profile';
import { storeImage } from '@/server/media';
import { db } from '@/server/db';
import { ConflictError } from '@/domain/content';
import { Prisma } from '@/generated/prisma/client';
export type Result = { error?: string; id?: string; ok?: boolean };
function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues.map((i) => i.message).join(' ');
  if (error instanceof ConflictError) return error.message;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
    return 'Такой адрес или название уже существует.';
  console.error('Content operation failed', error);
  return 'Не удалось сохранить. Проверьте поля и попробуйте ещё раз.';
}
export async function loginAction(_previous: Result, form: FormData): Promise<Result> {
  const login = String(form.get('login') ?? '').slice(0, 200),
    password = String(form.get('password') ?? '');
  if (password.length > 1024) return { error: 'Неверный логин или пароль.' };
  const error = await signIn(login, password);
  if (error) return { error };
  redirect('/admin');
}
export async function logoutAction() {
  await signOut();
  redirect('/admin/login');
}
export async function projectAction(raw: unknown): Promise<Result> {
  await requireAdmin();
  let id: string;
  try {
    id = await saveProject(raw);
  } catch (error) {
    return { error: errorMessage(error) };
  }
  revalidatePath('/', 'layout');
  return { id, ok: true };
}
export async function categoryAction(name: string): Promise<Result> {
  await requireAdmin();
  try {
    const valid = z.string().trim().min(1).max(80).parse(name);
    const category = await db().category.create({ data: { name: valid } });
    revalidatePath('/', 'layout');
    return { id: category.id, ok: true };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}
export async function uploadAction(form: FormData): Promise<Result> {
  await requireAdmin();
  const file = form.get('file');
  if (!(file instanceof File)) return { error: 'Выберите изображение.' };
  try {
    const media = await storeImage(file);
    return { id: media.id, ok: true };
  } catch (e) {
    console.error('Image upload failed', e);
    return {
      error: 'Не удалось загрузить фото. Допустимы JPEG, PNG, WebP до 10 МБ и 40 мегапикселей.',
    };
  }
}
