'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import OverviewTab from '@/app/repo/[owner]/[name]/_components/OverviewTab';
import StarHistoryTab from '@/app/repo/[owner]/[name]/_components/StarHistoryTab';
import type { RepoDetailData } from '@/types/rankings';

const TABS = ['Overview', 'Star History'] as const;
type Tab = (typeof TABS)[number];

interface CenterPanelProps {
  owner: string;
  name: string;
}

export default function CenterPanel({ owner, name }: CenterPanelProps) {
  const [tab, setTab] = useState<Tab>('Overview');

  const { data: repoDetail, isLoading, isError } = useQuery<RepoDetailData>({
    queryKey: ['repo-detail', owner, name],
    queryFn: async () => {
      const res = await fetch(
        `/api/repo-detail?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}`,
      );
      if (!res.ok) throw new Error('Not found');
      const json = (await res.json()) as { data: RepoDetailData };
      return json.data;
    },
    staleTime: 15 * 60 * 1000,
    retry: false,
  });

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px cursor-pointer px-5 py-3 text-sm transition-colors ${
              tab === t
                ? 'border-b-2 border-accent font-semibold text-foreground'
                : 'border-b-2 border-transparent text-muted hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-5">
        {isLoading ? (
          <CenterSkeleton />
        ) : isError || !repoDetail ? (
          <ErrorState owner={owner} name={name} />
        ) : (
          <>
            {tab === 'Overview' && <OverviewTab repoDetail={repoDetail} />}
            {tab === 'Star History' && <StarHistoryTab owner={owner} name={name} />}
          </>
        )}
      </div>
    </div>
  );
}

function ErrorState({ owner, name }: { owner: string; name: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertCircle className="h-10 w-10 text-muted" />
      <p className="font-semibold text-foreground">Repository not found</p>
      <p className="text-sm text-muted">
        <span className="font-mono">{owner}/{name}</span> could not be loaded.
        It may be private, not exist, or require a GitHub token.
      </p>
      <button
        onClick={() => router.back()}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
    </div>
  );
}

function CenterSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  );
}
