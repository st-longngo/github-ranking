import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import VisualizationsClient from '@/components/VisualizationsClient';

export const metadata: Metadata = {
  title: 'Visualizations',
  description: 'Interactive charts showing programming language rankings by GitHub activity.',
};

export default async function VisualizationsPage() {
  const { rankings, isStale } = await getRankings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Visualizations</h1>
        <p className="text-sm text-muted">
          Explore language metrics through interactive charts.
        </p>
      </div>
      <VisualizationsClient rankings={rankings} isStale={isStale} />
    </div>
  );
}
