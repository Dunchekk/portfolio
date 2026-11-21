import Image from 'next/image';
import { listNews } from '@/server/news';
import { monthYear } from '@/domain/content';
import { RichText } from '@/components/RichText';
import s from '@/components/site.module.css';
export const metadata = { title: 'News' };
export default async function Page() {
  const news = await listNews();
  return (
    <>
      <div className={s.toolbar}>
        <h1>News</h1>
      </div>
      <div className={s.news}>
        {news.map((n) => (
          <article key={n.id}>
            <h2>{n.title}</h2>
            <time dateTime={n.date.toISOString().slice(0, 10)}>{monthYear(n.date)}</time>
            {n.media && (
              <Image
                src={`/media/${n.media.id}`}
                alt={n.title}
                width={n.media.width}
                height={n.media.height}
                unoptimized
              />
            )}
            <RichText text={n.text} />
          </article>
        ))}
      </div>
      {news.length === 0 && <p>No news yet.</p>}
    </>
  );
}
