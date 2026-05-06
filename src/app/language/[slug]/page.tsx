import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { getLanguageDetail } from '@/services/csvService';
import { formatNumber } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MetricBar from './_components/MetricBar';
import RelatedLanguages from './_components/RelatedLanguages';
import TopRepos from './_components/TopRepos';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLanguageDetail(slug);
  if (!data) return { title: 'Language Not Found' };

  return {
    title: `${data.summary.language} — Language Detail`,
    description: `GitHub activity metrics for ${data.summary.language}: rank #${data.summary.rank}, composite score ${data.summary.compositeScore.toFixed(1)}.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function LanguageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getLanguageDetail(slug);

  if (!data) {
    // Language slug not found in CSV — show notFound only if it's an unknown slug
    // (ranking data may just not exist yet)
    notFound();
  }

  const { summary, percentiles, normalised, related, topRepos } = data;

  const rankLabel =
    summary.rank === 1 ? '🥇 #1' :
    summary.rank === 2 ? '🥈 #2' :
    summary.rank === 3 ? '🥉 #3' :
    `#${summary.rank}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Back navigation */}
      <Link
        href="/language"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Language Rankings
      </Link>

      {/* Page header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent select-none">
          {summary.language.slice(0, 2)}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {summary.language}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {rankLabel} overall &middot; Score{' '}
            <strong className="text-foreground">{summary.compositeScore.toFixed(1)}</strong>
            &nbsp;/ 100
            {summary.dataDate ? (
              <span className="ml-2">
                &middot; Updated{' '}
                <time dateTime={summary.dataDate}>{summary.dataDate}</time>
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <section aria-labelledby="metrics-heading" className="mb-8">
        <h2 id="metrics-heading" className="sr-only">Metrics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBar
            label="Composite Score"
            value={summary.compositeScore.toFixed(1)}
            normalised={normalised.compositeScore}
            percentile={percentiles.compositeScore}
            highlighted
          />
          <MetricBar
            label="Total Stars"
            value={formatNumber(summary.totalStars)}
            normalised={normalised.totalStars}
            percentile={percentiles.totalStars}
          />
          <MetricBar
            label="Total Forks"
            value={formatNumber(summary.totalForks)}
            normalised={normalised.totalForks}
            percentile={percentiles.totalForks}
          />
          <MetricBar
            label="Active Repos"
            value={formatNumber(summary.activityCount)}
            normalised={normalised.activityCount}
            percentile={percentiles.activityCount}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Based on top-{summary.repoCount} repositories &middot; Bar shows position relative to all {data.allSummaries.length} languages
        </p>
      </section>

      {/* Top repos */}
      <div className="mb-8">
        <TopRepos repos={topRepos} />
      </div>

      {/* Related languages */}
      {related.length > 0 && <RelatedLanguages languages={related} />}
    </main>
  );
}
