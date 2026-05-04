import type { Metadata } from 'next';
import LeaderboardExplorerClient from '@/components/LeaderboardExplorerClient';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description:
    'Explore trending GitHub repositories — weekly stars, all-time rankings, star history, and latest releases.',
};

export default function LeaderboardPage() {
  return <LeaderboardExplorerClient />;
}
