'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Pagination from '@/components/common/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { TopReposPage, RepoItem } from '@/types/rankings';

const TABS = ['Stars', 'Forks', 'Trending'] as const;
type Tab = (typeof TABS)[number];

const TAB_TYPE: Record<Tab, string> = {
  Stars: 'stars',
  Forks: 'forks',
  Trending: 'trending',
};

interface TopReposDetailClientProps {
  initialStarsData: TopReposPage;
}

export default function TopReposDetailClient({ initialStarsData }: TopReposDetailClientProps) {
  const [tab, setTab] = useState<Tab>('Stars');
  const [page, setPage] = useState(1);

  const activeType = TAB_TYPE[tab];

  const { data, isFetching } = useQuery<TopReposPage>({
    queryKey: ['top-repos-detail', activeType, page],
    queryFn: async () => {
      const res = await fetch(`/api/top-repos?type=${activeType}&page=${page}`);
      if (!res.ok) throw new Error('Failed');
      const json = (await res.json()) as { data: TopReposPage };
      return json.data;
    },
    initialData: tab === 'Stars' && page === 1 ? initialStarsData : undefined,
    staleTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const allRepos = data?.repos ?? [];
  const leftColumn = allRepos.slice(0, 50);
  const rightColumn = allRepos.slice(50, 100);
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / 100);

  function handleTabChange(next: Tab) {
    if (next === tab) return;
    setTab(next);
    setPage(1);
  }

  const metricLabel = tab === 'Stars' ? 'Stars' : tab === 'Forks' ? 'Forks' : 'Stars';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/top-ranking"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Top Ranking
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Top Repositories</h1>
          <p className="text-sm text-muted">
            Top GitHub repositories ranked by Stars, Forks, or recent Trending activity.
          </p>
        </div>
        <div className="shrink-0">
          <Pagination
            page={page}
            totalPages={totalPages}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Tab bar */}
      <Tabs value={tab} onValueChange={(v) => handleTabChange(v as Tab)}>
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          {TABS.map((t) => (
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

      {isFetching && allRepos.length === 0 ? (
        <RankingSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <RepoTable repos={leftColumn} metricLabel={metricLabel} tab={tab} isFetching={isFetching} />
          <RepoTable repos={rightColumn} metricLabel={metricLabel} tab={tab} isFetching={isFetching} />
        </div>
      )}
    </div>
  );
}

function RepoTable({
  repos,
  metricLabel,
  tab,
  isFetching,
}: {
  repos: RepoItem[];
  metricLabel: string;
  tab: Tab;
  isFetching: boolean;
}) {
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
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-accent"
                >
                  {repo.fullName}
                </a>
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

function RankingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
