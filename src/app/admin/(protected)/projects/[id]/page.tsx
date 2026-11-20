import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/auth';
import { getProject, getCategories } from '@/server/projects';
import { ProjectEditor } from '@/components/ProjectEditor';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const p = await getProject((await params).id);
  if (!p) notFound();
  return (
    <>
      <h1>Редактировать проект</h1>
      <ProjectEditor
        initialSaved={(await searchParams).saved === '1'}
        categories={await getCategories()}
        initial={{
          id: p.id,
          version: p.version,
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          date: p.date.toISOString().slice(0, 10),
          status: p.status,
          coverId: p.coverId,
          categoryIds: p.categories.map((c) => c.id),
          blocks: p.blocks.map((b) =>
            b.kind === 'TEXT'
              ? { id: b.id, kind: 'TEXT', column: b.column, text: b.text ?? '' }
              : {
                  id: b.id,
                  kind: 'IMAGE',
                  column: b.column,
                  mediaId: b.mediaId!,
                  alt: b.alt,
                  caption: b.caption,
                },
          ),
        }}
      />
    </>
  );
}
