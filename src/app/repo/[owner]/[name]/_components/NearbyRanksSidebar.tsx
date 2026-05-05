'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { TrendingReposResponse, NearbyRepo } from '@/types/rankings';

interface NearbyRanksSidebarProps {
  currentOwner: string;
  currentName: string;
}

export default function NearbyRanksSidebar({ currentOwner, currentName }: NearbyRanksSidebarProps) {
  const currentFullName = `${currentOwner}/${currentName}`.toLowerCase();

  const { data, isLoading } = useQuery<TrendingReposResponse>({
    queryKey: ['trending-repos', 'all-time'],
    queryFn: async () => {
      const res = await fetch('/api/trending-repos?mode=all-time');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = (await res.json()) as { data: TrendingReposResponse };
      return json.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const repos = data?.repos ?? [];

  const currentIdx = repos.findIndex(
    (r) => r.fullName.toLowerCase() === currentFullName,
  );

  let nearby: NearbyRepo[];
  if (currentIdx !== -1) {
    const start = Math.max(0, currentIdx - 5);
    const end = Math.min(repos.length, currentIdx + 6);
    nearby = repos.slice(start, end).map((r) => ({
      rank: r.rank,
      fullName: r.fullName,
      starCount: r.starCount,
      htmlUrl: r.htmlUrl,
    }));
  } else {
    nearby = repos.slice(0, 15).map((r) => ({
      rank: r.rank,
      fullName: r.fullName,
      starCount: r.starCount,
      htmlUrl: r.htmlUrl,
    }));
  }

  return (
    <aside>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
        Top Repos
      </h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </div>
      ) : nearby.length === 0 ? (
        <p className="text-xs text-muted">No data available</p>
      ) : (
        <ul className="space-y-0.5">
          {nearby.map((repo) => {
            const [rOwner, rName] = repo.fullName.split('/');
            const isCurrent = repo.fullName.toLowerCase() === currentFullName;
            return (
              <li key={repo.fullName}>
                <Link
                  href={`/repo/${rOwner}/${rName}`}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    isCurrent
                      ? 'bg-accent/10 font-semibold text-accent'
                      : 'text-muted hover:bg-surface hover:text-foreground'
                  }`}
                >
                  <span className="w-5 shrink-0 text-right font-mono">{repo.rank}</span>
                  <span className="min-w-0 flex-1 truncate">{rName}</span>
                  <span className="shrink-0 font-mono">{formatNumber(repo.starCount)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
