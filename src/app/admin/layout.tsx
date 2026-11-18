import s from '@/components/admin.module.css';
export const metadata = { title: 'Admin', robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main lang="ru" className={s.admin}>
      {children}
    </main>
  );
}
