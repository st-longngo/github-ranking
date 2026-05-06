'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/common/Pagination';
import UserTable from '@/app/ranking/users/_components/UserTable';
import RankingSkeleton from '@/app/ranking/_components/RankingSkeleton';
import type { TopUsersPage } from '@/types/rankings';

interface TopUsersDetailClientProps {
  initialData: TopUsersPage;
}

export default function TopUsersDetailClient({ initialData }: TopUsersDetailClientProps) {
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery<TopUsersPage>({
    queryKey: ['top-users', page],
    queryFn: async () => {
      const res = await fetch(`/api/top-users?page=${page}`);
      if (!res.ok) throw new Error('Failed');
      const json = (await res.json()) as { data: TopUsersPage };
      return json.data;
    },
    initialData: page === 1 ? initialData : undefined,
    staleTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const allUsers = data?.users ?? [];
  const leftColumn = allUsers.slice(0, 50);
  const rightColumn = allUsers.slice(50, 100);
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/ranking"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Ranking
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Top Users</h1>
          <p className="text-sm text-muted">
            Top GitHub users ranked by followers.
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

      {isFetching && allUsers.length === 0 ? (
        <RankingSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <UserTable users={leftColumn} isFetching={isFetching} />
          <UserTable users={rightColumn} isFetching={isFetching} />
        </div>
      )}
    </div>
  );
}
