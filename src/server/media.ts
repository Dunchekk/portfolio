import 'server-only';
import { mkdir, writeFile, rename, readFile, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { db } from './db';
const directory = () =>
  resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || '.data/uploads');
export async function storeImage(file: File) {
  if (!file.size || file.size > 10 * 1024 * 1024)
    throw new Error('Фото должно быть не больше 10 МБ.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const input = sharp(bytes, { limitInputPixels: 40_000_000, failOn: 'warning' });
  const metadata = await input.metadata();
  if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) > 1)
    throw new Error('Поддерживаются статичные JPEG, PNG и WebP.');
  // Re-encode to strip metadata and never serve the original upload as executable content.
  const { data, info } = await input
    .rotate()
    .resize({ width: 3000, height: 3000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer({ resolveWithObject: true });
  const key = `${randomUUID()}.webp`;
  await mkdir(directory(), { recursive: true });
  const temporary = join(directory(), `${key}.tmp`);
  await writeFile(temporary, data, { flag: 'wx', mode: 0o600 });
  await rename(temporary, join(directory(), key));
  try {
    return await db().media.create({
      data: { key, width: info.width, height: info.height, bytes: info.size, mime: 'image/webp' },
    });
  } catch (error) {
    await unlink(join(directory(), key)).catch(() => {});
    throw error;
  }
}
export const readImage = (key: string) => {
  if (!/^[a-f0-9-]+\.webp$/.test(key)) throw new Error('Invalid storage key');
  return readFile(/* turbopackIgnore: true */ join(/* turbopackIgnore: true */ directory(), key));
};
