import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import ComparisonClient from '@/components/ComparisonClient';

export const metadata: Metadata = {
  title: 'Compare Languages',
  description: 'Side-by-side comparison of programming language metrics from GitHub.',
};

export default async function ComparePage() {
  const { rankings, isStale } = await getRankings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Compare Languages</h1>
        <p className="text-sm text-muted">
          Select up to 4 languages to compare their metrics side-by-side.
        </p>
      </div>
      <ComparisonClient rankings={rankings} isStale={isStale} />
    </div>
  );
}
