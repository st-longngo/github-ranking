import type { Metadata } from 'next';
import { getTopRepos } from '@/lib/github';
import TopRankingClient from '@/components/TopRankingClient';

export const metadata: Metadata = {
  title: 'Top Ranking',
  description: 'Top GitHub repositories ranked by Stars, Forks, or recent Trending activity.',
};

export default async function TopRankingPage() {
  // SSR only the default tab (Stars, page 1) — subsequent pages/tabs fetch via Route Handler
  const initialStarsPage1 = await getTopRepos('stars', 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TopRankingClient initialStarsPage1={initialStarsPage1} />
    </div>
  );
}

