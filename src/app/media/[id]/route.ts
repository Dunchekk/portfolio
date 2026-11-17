import { db } from '@/server/db';
import { isAdmin } from '@/server/auth';
import { publicMedia, readImage } from '@/server/media';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media =
    (await publicMedia(id)) ??
    ((await isAdmin()) ? await db().media.findUnique({ where: { id } }) : null);
  if (!media) return new Response(null, { status: 404 });
  try {
    return new Response(new Uint8Array(await readImage(media.key)), {
      headers: {
        'Content-Type': media.mime,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
