import Link from 'next/link';
import Image from 'next/image';
import { listProjects, getCategories } from '@/server/projects';
import { monthYear } from '@/domain/content';
import s from './site.module.css';
export async function Archive({
  query,
  preview = false,
}: {
  query: Record<string, string | string[] | undefined>;
  preview?: boolean;
}) {
  const value = (key: string) => (typeof query[key] === 'string' ? (query[key] as string) : '');
  const q = value('q').slice(0, 200),
    category = value('category'),
    sort = value('sort') || 'date-desc';
  const [projects, categories] = await Promise.all([
    listProjects({ q, category, sort }),
    getCategories(),
  ]);
  const visibleProjects = projects.filter((p) => !preview || p.status === 'PUBLISHED');
  const url = (nextSort: string) => `?${new URLSearchParams({ q, category, sort: nextSort })}`;
  return (
    <>
      {visibleProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className={preview ? s.preview : s.archive}>
          {visibleProjects.map((p) =>
            preview ? (
              <Link prefetch={false} href={`/archive/${p.slug}`} key={p.id}>
                {p.cover && (
                  <Image
                    src={`/media/${p.cover.id}`}
                    alt={p.title}
                    width={p.cover.width}
                    height={p.cover.height}
                    unoptimized
                    loading="lazy"
                  />
                )}
                <div>{p.title}</div>
              </Link>
            ) : (
              <div className={s.row} key={p.id}>
                {p.status === 'PUBLISHED' ? (
                  <Link prefetch={false} href={`/archive/${p.slug}`}>
                    {p.title}
                  </Link>
                ) : (
                  <span className={s.listed} title="Project page coming soon">
                    {p.title}
                  </span>
                )}
                <time dateTime={p.date.toISOString().slice(0, 10)}>{monthYear(p.date)}</time>
              </div>
            ),
          )}
        </div>
      )}
    </>
  );
}
