'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/common/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { TopOrgsPage, TopOrgItem } from '@/types/rankings';

interface TopOrgsDetailClientProps {
  initialData: TopOrgsPage;
}

export default function TopOrgsDetailClient({ initialData }: TopOrgsDetailClientProps) {
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery<TopOrgsPage>({
    queryKey: ['top-orgs', page],
    queryFn: async () => {
      const res = await fetch(`/api/top-orgs?page=${page}`);
      if (!res.ok) throw new Error('Failed');
      const json = (await res.json()) as { data: TopOrgsPage };
      return json.data;
    },
    initialData: page === 1 ? initialData : undefined,
    staleTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const allOrgs = data?.orgs ?? [];
  const leftColumn = allOrgs.slice(0, 50);
  const rightColumn = allOrgs.slice(50, 100);
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / 100);

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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Top Organizations</h1>
          <p className="text-sm text-muted">
            Top GitHub organizations ranked by followers.
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

      {isFetching && allOrgs.length === 0 ? (
        <RankingSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <OrgTable orgs={leftColumn} isFetching={isFetching} />
          <OrgTable orgs={rightColumn} isFetching={isFetching} />
        </div>
      )}
    </div>
  );
}

function OrgTable({ orgs, isFetching }: { orgs: TopOrgItem[]; isFetching: boolean }) {
  if (orgs.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted">
            <th className="w-16 px-4 py-2.5">Rank</th>
            <th className="px-4 py-2.5">Organization</th>
            <th className="px-4 py-2.5 text-right">Followers</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr
              key={org.login}
              className={`border-b border-border/30 ${isFetching ? 'opacity-50' : ''}`}
            >
              <td className="px-4 py-2 text-sm text-muted">{org.rank}</td>
              <td className="px-4 py-2">
                <a
                  href={org.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
                >
                  <Image
                    src={org.avatarUrl}
                    alt={org.login}
                    className="h-5 w-5 rounded-full"
                    width={20}
                    height={20}
                  />
                  {org.login}
                </a>
              </td>
              <td className="px-4 py-2 text-right text-sm tabular-nums text-muted">
                {formatNumber(org.followers)}
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
