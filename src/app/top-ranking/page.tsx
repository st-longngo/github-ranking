import type { Metadata } from 'next';
import { getTopRepos, getTopUsers, getTopOrgs } from '@/services/github';
import TopRankingOverview from '@/app/top-ranking/_components/TopRankingOverview';

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
    <TopRankingOverview
      initialUsers={usersData}
      initialOrgs={orgsData}
      initialRepos={reposData}
    />
  );
}

