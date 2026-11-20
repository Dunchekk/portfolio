import { requireAdmin } from '@/server/auth';
import { getCategories } from '@/server/projects';
import { ProjectEditor } from '@/components/ProjectEditor';
export default async function Page() {
  await requireAdmin();
  return (
    <>
      <h1>Новый проект</h1>
      <ProjectEditor
        categories={await getCategories()}
        initial={{
          version: 0,
          title: '',
          slug: '',
          summary: '',
          date: new Date().toISOString().slice(0, 10),
          status: 'DRAFT',
          categoryIds: [],
          coverId: null,
          blocks: [],
        }}
      />
    </>
  );
}
