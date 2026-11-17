import { getProfile } from '@/server/profile';
import { RichText } from '@/components/RichText';
import s from '@/components/site.module.css';
export const metadata = { title: 'contact' };
export default async function Page() {
  const profile = await getProfile();
  return (
    <>
      <div className={s.toolbar}>
        <h1>contact</h1>
      </div>
      <div className={s.about}>
        <RichText text={profile.contact || 'Coming soon.'} />
      </div>
    </>
  );
}
