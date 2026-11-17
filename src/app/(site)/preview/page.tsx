import { Archive } from '@/components/Archive';
export const metadata = { title: 'Preview' };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Archive query={await searchParams} preview />;
}
