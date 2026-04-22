'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkeletonTopRanking from '@/components/common/SkeletonTopRanking';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import RankBadge from '@/components/ui/RankBadge';
import type { TopReposPage } from '@/types/rankings';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

const TABS = ['Stars', 'Forks', 'Trending'] as const;
type Tab = (typeof TABS)[number];

const TAB_TYPE: Record<Tab, string> = {
  Stars: 'stars',
  Forks: 'forks',
  Trending: 'trending',
};

const STALE_TIME = 30 * 60 * 1000; // 30 min — match server cache TTL

interface TopRankingClientProps {
  initialStarsPage1: TopReposPage;
}

async function fetchTopRepos(type: string, page: number): Promise<TopReposPage> {
  const res = await fetch(`/api/top-repos?type=${type}&page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch top repos');
  const json = (await res.json()) as { data: TopReposPage };
  return json.data;
}

function EmptyState() {
  return (
    <div className="py-16 text-center text-sm text-muted">
      No repository data available. Ensure{' '}
      <code className="rounded bg-secondary px-1">GITHUB_TOKEN</code> is configured.
    </div>
  );
}

export default function TopRankingClient({ initialStarsPage1 }: TopRankingClientProps) {
  const [tab, setTab] = useState<Tab>('Stars');
  const [page, setPage] = useState(1);

  const activeType = TAB_TYPE[tab];

  const { data, isFetching } = useQuery<TopReposPage>({
    queryKey: ['top-repos', activeType, page],
    queryFn: () => fetchTopRepos(activeType, page),
    initialData: tab === 'Stars' && page === 1 ? initialStarsPage1 : undefined,
    staleTime: STALE_TIME,
    placeholderData: prev => prev, // keep previous data visible during transition
  });

  function handleTabChange(next: Tab) {
    if (next === tab) return;
    setTab(next);
    setPage(1);
  }

  const repos = data?.repos ?? [];
  const hasNextPage = data?.hasNextPage ?? false;
  const totalCount = data?.totalCount ?? 0;
  const isStale = data?.isStale ?? false;

  // Show full skeleton when there's no previous data to display (first load of a new tab)
  if (isFetching && repos.length === 0) {
    return <SkeletonTopRanking />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Top Ranking</h1>
        <p className="text-sm text-muted">
          Top GitHub repositories ranked by Stars, Forks, or recent Trending activity.
        </p>
      </div>

      {/* Stale data banner */}
      {isStale && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            Displaying cached data. GitHub API rate limit reached or token not configured — data may be up to 30 minutes old.
          </AlertDescription>
        </Alert>
      )}

      {/* Tab bar */}
      <Tabs value={tab} onValueChange={v => handleTabChange(v as Tab)}>
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0 border-b border-border">
          {TABS.map(t => (
            <TabsTrigger
              key={t}
              value={t}
              className="-mb-px rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted shadow-none transition-colors hover:text-foreground data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{formatNumber(totalCount)} repositories found</span>
        {isFetching && <span className="animate-pulse">Loading…</span>}
      </div>

      {/* Table */}
      <div
        role="tabpanel"
        aria-labelledby={`tab-${tab.toLowerCase()}`}
        className="overflow-x-auto rounded-xl border border-border bg-surface"
      >
        {repos.length === 0 && !isFetching ? (
          <EmptyState />
        ) : (
          <Table aria-label={`${tab} ranking`}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead className="hidden max-w-xs sm:table-cell">Description</TableHead>
                <TableHead className="text-right">
                  {tab === 'Stars' ? 'Stars' : tab === 'Forks' ? 'Forks' : 'Last Updated'}
                </TableHead>
                <TableHead className="text-right text-muted">
                  {tab === 'Trending' ? 'Stars' : 'Forks'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repos.map(repo => (
                <TableRow key={repo.fullName} className={isFetching ? 'opacity-50' : undefined}>
                  <TableCell>
                    <RankBadge rank={repo.rank} />
                  </TableCell>
                  <TableCell className="font-semibold">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent hover:underline"
                    >
                      {repo.fullName}
                    </a>
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-sm text-muted sm:table-cell">
                    {repo.description ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {tab === 'Stars' && (
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {formatNumber(repo.starCount)}
                      </span>
                    )}
                    {tab === 'Forks' && (
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(repo.forkCount)}
                      </span>
                    )}
                    {tab === 'Trending' && (
                      <span className="font-mono text-xs text-live">
                        {formatRelativeTime(repo.pushedAt)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted">
                    {tab === 'Trending'
                      ? formatNumber(repo.starCount)
                      : formatNumber(repo.forkCount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1 || isFetching}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm text-muted tabular-nums">
          Page <span className="font-semibold text-foreground">{page}</span>
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => p + 1)}
          disabled={!hasNextPage || isFetching}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
