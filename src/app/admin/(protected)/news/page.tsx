import { requireAdmin } from '@/server/auth';
import { listNews } from '@/server/news';
import { NewsEditor } from '@/components/NewsEditor';
export default async function Page() {
  await requireAdmin();
  return (
    <>
      <h1>Новости</h1>
      <NewsEditor
        items={(await listNews(true)).map((n) => ({
          ...n,
          date: n.date.toISOString().slice(0, 10),
        }))}
      />
    </>
  );
}
