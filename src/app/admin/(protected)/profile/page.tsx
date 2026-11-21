import { requireAdmin } from '@/server/auth';
import { getProfile } from '@/server/profile';
import { ProfileEditor } from '@/components/ProfileEditor';
export default async function Page() {
  await requireAdmin();
  return (
    <>
      <h1>About и контакты</h1>
      <ProfileEditor initial={await getProfile()} />
    </>
  );
}
