'use client';

import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import type { RepoItem } from '@/types/rankings';

type Tab = 'Stars' | 'Forks' | 'Trending';

interface RepoTableProps {
  repos: RepoItem[];
  metricLabel: string;
  tab: Tab;
  isFetching: boolean;
}

export default function RepoTable({ repos, metricLabel, tab, isFetching }: RepoTableProps) {
  if (repos.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted">
            <th className="w-16 px-4 py-2.5">Rank</th>
            <th className="px-4 py-2.5">Repository</th>
            <th className="px-4 py-2.5 text-right">{metricLabel}</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => (
            <tr
              key={repo.fullName}
              className={`border-b border-border/30 ${isFetching ? 'opacity-50' : ''}`}
            >
              <td className="px-4 py-2 text-sm text-muted">{repo.rank}</td>
              <td className="px-4 py-2">
                <Link
                  href={`/repo/${repo.fullName}`}
                  className="text-sm font-medium text-foreground hover:text-accent"
                >
                  {repo.fullName}
                </Link>
              </td>
              <td className="px-4 py-2 text-right text-sm tabular-nums text-muted">
                {tab === 'Forks'
                  ? formatNumber(repo.forkCount)
                  : formatNumber(repo.starCount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
