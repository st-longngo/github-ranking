import type { Metadata } from 'next';
import { getTopRepos, getTopUsers, getTopOrgs } from '@/lib/github';
import TopRankingOverview from '@/components/TopRankingOverview';

export const metadata: Metadata = {
  title: 'Top Ranking',
  description: 'Top GitHub users, organizations, and repositories ranked by stars.',
};

export default async function TopRankingPage() {
  const [usersData, orgsData, reposData] = await Promise.all([
    getTopUsers(1),
    getTopOrgs(1),
    getTopRepos('stars', 1),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TopRankingOverview
        initialUsers={usersData}
        initialOrgs={orgsData}
        initialRepos={reposData}
      />
    </div>
  );
}

