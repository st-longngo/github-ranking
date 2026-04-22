import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { getLanguageRanking, getRelatedLanguages } from '@/lib/rankings';
import { formatNumber } from '@/lib/utils';
import RankBadge from '@/components/ui/RankBadge';
import MetricBar from '@/components/ui/MetricBar';
import LanguageReposClient from '@/components/LanguageReposClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { COMPOSITE_WEIGHTS, METRIC_LABELS } from '@/types/rankings';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { language } = await getLanguageRanking(slug);
  if (!language) return { title: 'Not Found' };
  return {
    title: language.name,
    description: `${language.name} is ranked #${language.rank} with a composite score of ${language.compositeScore.toFixed(1)} based on GitHub repository activity.`,
  };
}

export default async function LanguageDetailPage({ params }: Props) {
  const { slug } = await params;
  const { language: lang, allRankings, isStale, rateLimitResetAt } = await getLanguageRanking(slug);

  if (!lang) notFound();

  const related = getRelatedLanguages(allRankings, lang, 5);

  const metricRows = [
    {
      label: METRIC_LABELS.repositories,
      value: lang.normalized.repositories,
      raw: formatNumber(lang.repositoryCount),
      colorClass: 'bg-blue-400',
    },
    {
      label: METRIC_LABELS.stars,
      value: lang.normalized.stars,
      raw: formatNumber(lang.starCount),
      colorClass: 'bg-amber-400',
    },
    {
      label: METRIC_LABELS.forks,
      value: lang.normalized.forks,
      raw: formatNumber(lang.forkCount),
      colorClass: 'bg-purple-400',
    },
    {
      label: METRIC_LABELS.activity,
      value: lang.normalized.activity,
      raw: `${lang.activityCount} active`,
      colorClass: 'bg-emerald-400',
    },
  ];

  const statCards = [
    { label: 'Repositories', value: formatNumber(lang.repositoryCount), color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Stars (top 100)', value: formatNumber(lang.starCount), color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Forks (top 100)', value: formatNumber(lang.forkCount), color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Active repos', value: formatNumber(lang.activityCount), color: 'text-live' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <Link href="/" className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
        ← Back to rankings
      </Link>

      {rateLimitResetAt && (
        <Alert variant="warning" className="mb-4 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            GitHub API rate limit exceeded. Showing cached data. Resets at{' '}
            <span className="font-mono font-semibold">
              {new Date(rateLimitResetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>.
          </AlertDescription>
        </Alert>
      )}

      {isStale && !rateLimitResetAt && (
        <Alert variant="warning" className="mb-4 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>Showing estimated data — live GitHub data unavailable.</AlertDescription>
        </Alert>
      )}

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{lang.name}</h1>
            <span className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xl font-bold text-accent">
              #{lang.rank}
            </span>
          </div>
          <p className="text-sm text-muted">
            Composite score:{' '}
            <span className="font-mono font-bold text-accent metric-glow">
              {lang.compositeScore.toFixed(1)}
            </span>
            <span className="ml-2 text-xs">
              ({Object.entries(COMPOSITE_WEIGHTS)
                .map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)} ${v * 100}%`)
                .join(' + ')})
            </span>
          </p>
        </div>
        <RankBadge rank={lang.rank} />
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(card => (
          <Card key={card.label}>
            <CardContent className="px-4 py-3">
              <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted">
                {card.label}
              </p>
              <p className={`mt-1 font-mono text-xl font-bold tabular-nums ${card.color}`}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Percentile bars ──────────────────────────────────── */}
      <Card className="mb-8">
        <CardContent className="p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Percentile scores (0 – 100)
          </h2>
          <div className="space-y-4">
            {metricRows.map(row => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium">{row.label}</span>
                  <span className="font-mono text-xs text-muted">{row.raw}</span>
                </div>
                <MetricBar value={row.value} colorClass={row.colorClass} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Top 100 repositories ─────────────────────────────── */}
      <div className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Top 100 repositories by stars
        </h2>
        <LanguageReposClient slug={slug} />
      </div>

      {/* ── Similar languages ────────────────────────────────── */}
      {related.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Similar languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map(r => (
              <Link
                key={r.slug}
                href={`/language/${r.slug}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm transition-all duration-150 hover:border-accent hover:text-accent"
              >
                <RankBadge rank={r.rank} size="sm" />
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
