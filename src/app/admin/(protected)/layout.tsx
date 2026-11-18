import Link from 'next/link';
import { requireAdmin } from '@/server/auth';
import { logoutAction } from '../actions';
import s from '@/components/admin.module.css';
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <nav className={s.nav}>
        <Link href="/admin">Проекты</Link>
        <Link href="/admin/profile">About и контакты</Link>
        <Link href="/admin/news">Новости</Link>
        <Link href="/">Открыть сайт</Link>
        <form action={logoutAction}>
          <button>Выйти</button>
        </form>
      </nav>
      {children}
    </>
  );
}
