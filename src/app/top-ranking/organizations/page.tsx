import type { Metadata } from 'next';
import { getTopOrgs } from '@/services/github';
import TopOrgsDetailClient from '@/app/top-ranking/organizations/_components/TopOrgsDetailClient';

export const metadata: Metadata = {
  title: 'Top Organizations',
  description: 'Top GitHub organizations ranked by followers.',
};

export default async function TopOrgsPage() {
  const initialData = await getTopOrgs(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <TopOrgsDetailClient initialData={initialData} />
    </div>
  );
}
