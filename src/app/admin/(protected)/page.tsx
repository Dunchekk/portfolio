import Link from 'next/link';
import { requireAdmin } from '@/server/auth';
import { listProjects } from '@/server/projects';
import s from '@/components/admin.module.css';
export default async function Page() {
  await requireAdmin();
  const projects = await listProjects({ admin: true });
  return (
    <>
      <h1>Проекты</h1>
      <p className={s.notice}>
        <Link href="/admin/projects/new">+ Добавить проект</Link>
      </p>
      <ul className={s.list}>
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/projects/${p.id}`}>{p.title}</Link>
            <span>{p.status}</span>
            {p.status === 'PUBLISHED' && <Link href={`/archive/${p.slug}`}>Открыть →</Link>}
          </li>
        ))}
      </ul>
      {!projects.length && <p>Проектов пока нет. Добавьте первый.</p>}
    </>
  );
}
