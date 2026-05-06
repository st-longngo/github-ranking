import type { Metadata } from 'next';
import { getTopUsers } from '@/services/github';
import TopUsersDetailClient from '@/app/top-ranking/users/_components/TopUsersDetailClient';

export const metadata: Metadata = {
  title: 'Top Users',
  description: 'Top GitHub users ranked by followers.',
};

export default async function TopUsersPage() {
  const initialData = await getTopUsers(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <TopUsersDetailClient initialData={initialData} />
    </div>
  );
}
