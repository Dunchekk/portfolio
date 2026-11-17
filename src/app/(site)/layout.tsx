import Link from 'next/link';
import { connection } from 'next/server';
import { getProfile } from '@/server/profile';
import { Navigation } from '@/components/Navigation';
import s from '@/components/site.module.css';
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const profile = await getProfile();
  return (
    <div className={s.shell}>
      <a href="#content" className="skip">
        Skip to content
      </a>
      <header className={s.header}>
        <Link href="/" className={s.name}>
          {profile.name}
        </Link>
        <form action="/" className={s.search} role="search">
          <input aria-label="Search projects" placeholder="Search" name="q" maxLength={200} />
        </form>
        <Navigation />
      </header>
      <main id="content" className={s.main}>
        {children}
      </main>
      <footer className={s.footer}>
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </div>
  );
}
