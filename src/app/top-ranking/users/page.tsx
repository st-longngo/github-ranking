import type { Metadata } from 'next';
import { getTopUsers } from '@/lib/github';
import TopUsersDetailClient from '@/components/TopUsersDetailClient';

export const metadata: Metadata = {
  title: 'Top Users',
  description: 'Top GitHub users ranked by followers.',
};

export default async function TopUsersPage() {
  const initialData = await getTopUsers(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TopUsersDetailClient initialData={initialData} />
    </div>
  );
}
