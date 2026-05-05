import type { Metadata } from 'next';
import { getTopRepos } from '@/lib/github';
import TopReposDetailClient from '@/app/top-ranking/repositories/_components/TopReposDetailClient';

export const metadata: Metadata = {
  title: 'Top Repositories',
  description: 'Top GitHub repositories ranked by Stars, Forks, or recent Trending activity.',
};

export default async function TopReposPage() {
  const initialStarsData = await getTopRepos('stars', 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <TopReposDetailClient initialStarsData={initialStarsData} />
    </div>
  );
}
