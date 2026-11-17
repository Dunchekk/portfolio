import { Archive } from '@/components/Archive';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Archive query={await searchParams} />;
}
