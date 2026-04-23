import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import LeaderboardClient from '@/components/LeaderboardClient';
import { COMPOSITE_WEIGHTS } from '@/types/rankings';
import { formatNumber } from '@/lib/utils';

// Revalidate this page every 5 minutes in the background (ISR).
// Users always get the cached page instantly; GitHub data is refreshed server-side.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Leaderboard',
  description:
    'Real-time ranking of programming languages by GitHub activity — repositories, stars, forks, and development momentum.',
};

export default async function LeaderboardPage() {
  const { rankings, fetchedAt, isStale } = await getRankings();

  const totalRepos  = rankings.reduce((s, r) => s + r.repositoryCount, 0);
  const totalStars  = rankings.reduce((s, r) => s + r.starCount, 0);
  const totalForks  = rankings.reduce((s, r) => s + r.forkCount, 0);
  const totalActive = rankings.reduce((s, r) => s + r.activityCount, 0);

  const statCards = [
    { label: 'Total Repositories', value: formatNumber(totalRepos),  color: 'text-blue-600  dark:text-blue-400'    },
    { label: 'Stars (top 100)',     value: formatNumber(totalStars),  color: 'text-amber-600 dark:text-amber-400'   },
    { label: 'Forks (top 100)',     value: formatNumber(totalForks),  color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Active repos (30d)',  value: formatNumber(totalActive), color: 'text-live'                            },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Language Rankings
              </h1>
              {!isStale && (
                <span className="flex items-center gap-1 rounded-full border border-live/30 bg-live/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-live">
                  <span className="live-dot h-1.5 w-1.5" aria-hidden="true" />
                  Live
                </span>
              )}
            </div>
            <p className="text-sm text-muted">
              Composite score:{' '}
              {Object.entries(COMPOSITE_WEIGHTS)
                .map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)} ${v * 100}%`)
                .join(' + ')}
              .{' '}
            </p>
          </div>

          {/* Monitor count badge */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
            <span className="live-dot h-1.5 w-1.5" aria-hidden="true" />
            <span className="font-mono">{rankings.length} languages monitored</span>
          </div>
        </div>

        {/* ── Metric summary cards ───────────────────────────── */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map(card => (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-surface px-4 py-3"
            >
              <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted">
                {card.label}
              </p>
              <p className={`mt-1 font-mono text-xl font-bold tabular-nums ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <LeaderboardClient initialData={{ rankings, fetchedAt, isStale }} />
    </div>
  );
}
