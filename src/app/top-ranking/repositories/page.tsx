import type { Metadata } from 'next';
import { getTopRepos } from '@/lib/github';
import TopReposDetailClient from '@/components/TopReposDetailClient';

export const metadata: Metadata = {
  title: 'Top Repositories',
  description: 'Top GitHub repositories ranked by Stars, Forks, or recent Trending activity.',
};

export default async function TopReposPage() {
  const initialStarsData = await getTopRepos('stars', 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TopReposDetailClient initialStarsData={initialStarsData} />
    </div>
  );
}
