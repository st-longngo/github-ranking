'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/common/Pagination';
import OrgTable from '@/app/top-ranking/organizations/_components/OrgTable';
import RankingSkeleton from '@/app/top-ranking/_components/RankingSkeleton';
import type { TopOrgsPage } from '@/types/rankings';

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
