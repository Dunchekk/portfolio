'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './site.module.css';
export function Navigation() {
  const path = usePathname();
  return (
    <nav className={s.navigation} aria-label="Main navigation">
      {[
        ['/', 'Archive'],
        ['/preview', 'Preview'],
        ['/news', 'News'],
        ['/about', 'About'],
        ['/contact', 'Contact'],
      ].map(([href, label]) => (
        <Link
          prefetch={false}
          key={href}
          href={href}
          className={path === href ? s.active : undefined}
          aria-current={path === href ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
