import type { Metadata } from 'next';
import TrendingFeed from '@/app/_components/TrendingFeed';

export const metadata: Metadata = {
  title: 'Explore',
  description:
    'Discover trending GitHub repositories, top programming languages, and open-source projects.',
};

export default function ExplorePage() {
  return <TrendingFeed />;
}
