'use client';
import Link from 'next/link';
import s from './site.module.css';
export function ArchiveFilters({
  q,
  category,
  sort,
  preview,
  categories,
}: {
  q: string;
  category: string;
  sort: string;
  preview: boolean;
  categories: { id: string; name: string }[];
}) {
  return (
    <form className={s.filters}>
      <input type="hidden" name="q" value={q} />
      <select
        name="category"
        aria-label="Category"
        defaultValue={category}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="">Categories:</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input type="hidden" name="sort" value={sort} />
      <noscript>
        <button>Apply</button>
      </noscript>
      {(q || category) && <Link href={preview ? '/preview' : '/'}>Reset</Link>}
    </form>
  );
}
