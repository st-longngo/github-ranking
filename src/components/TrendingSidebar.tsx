'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Star, TrendingUp, Shuffle, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn, formatNumber } from '@/lib/utils';
import type { TrendingMode, TrendingRepo, TrendingReposResponse } from '@/types/rankings';

interface TrendingSidebarProps {
  selectedRepo: string | null;
  onSelectRepo: (fullName: string) => void;
}

const MODE_ICONS: Record<TrendingMode, React.ReactNode> = {
  weekly: <TrendingUp className="h-3.5 w-3.5" />,
  'all-time': <Star className="h-3.5 w-3.5" />,
  random: <Shuffle className="h-3.5 w-3.5" />,
};

function RankIndicator({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-sm" title="1st place">🥇</span>;
  if (rank === 2) return <span className="text-sm" title="2nd place">🥈</span>;
  if (rank === 3) return <span className="text-sm" title="3rd place">🥉</span>;
  return <span className="font-mono text-xs text-muted">{rank}</span>;
}

function RepoItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-6 w-6 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function TrendingSidebar({ selectedRepo, onSelectRepo }: TrendingSidebarProps) {
  const [mode, setMode] = useState<TrendingMode>('weekly');

  const { data, isLoading, isError, refetch } = useQuery<TrendingReposResponse>({
    queryKey: ['trending-repos', mode],
    queryFn: async () => {
      const res = await fetch(`/api/trending-repos?mode=${mode}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json() as { data: TrendingReposResponse };
      return json.data;
    },
    staleTime: mode === 'random' ? 0 : 5 * 60 * 1000,
  });

  const repos = data?.repos ?? [];

  return (
    <aside className="flex h-full flex-col bg-surface">
      {/* Tab bar — sticky at top */}
      <div className="sticky top-0 z-10 border-b border-border bg-surface p-2">
        <Tabs value={mode} onValueChange={(v) => setMode(v as TrendingMode)}>
          <TabsList className="grid w-full grid-cols-3 bg-background">
            <TabsTrigger value="weekly" className="gap-1 text-xs">
              {MODE_ICONS.weekly}
              <span className="hidden sm:inline">Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="all-time" className="gap-1 text-xs">
              {MODE_ICONS['all-time']}
              <span className="hidden sm:inline">All-time</span>
            </TabsTrigger>
            <TabsTrigger value="random" className="gap-1 text-xs">
              {MODE_ICONS.random}
              <span className="hidden sm:inline">Random</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Repo list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <RepoItemSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-sm text-muted">Failed to load repos</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </div>
        ) : repos.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted">
            No repos found
          </div>
        ) : (
          <ul role="list" className="divide-y divide-border/50">
            {repos.map((repo) => (
              <RepoListItem
                key={repo.fullName}
                repo={repo}
                isSelected={selectedRepo === repo.fullName}
                showDelta={mode === 'weekly'}
                onSelect={() => onSelectRepo(repo.fullName)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-3 py-2">
        <p className="flex items-center gap-1.5 text-[10px] text-muted">
          <Clock className="h-3 w-3" />
          {mode === 'weekly' ? 'Stars gained this week' : mode === 'all-time' ? 'All-time top starred' : 'Random discovery'}
        </p>
      </div>
    </aside>
  );
}

function RepoListItem({
  repo,
  isSelected,
  showDelta,
  onSelect,
}: {
  repo: TrendingRepo;
  isSelected: boolean;
  showDelta: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
          isSelected
            ? 'bg-accent/10 border-l-2 border-accent'
            : 'hover:bg-border/30 border-l-2 border-transparent',
        )}
      >
        {/* Rank */}
        <div className="flex w-6 shrink-0 items-center justify-center">
          <RankIndicator rank={repo.rank} />
        </div>

        {/* Avatar */}
        <Image
          src={repo.ownerAvatar}
          alt={repo.fullName}
          className="h-6 w-6 shrink-0 rounded-full"
          width={24}
          height={24}
        />

        {/* Info */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium text-foreground" title={repo.fullName}>
            {repo.fullName}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3" />
              {formatNumber(repo.starCount)}
            </span>
            {showDelta && repo.weeklyStarDelta > 0 && (
              <span className="font-medium text-live">
                +{formatNumber(repo.weeklyStarDelta)}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>
    </li>
  );
}
