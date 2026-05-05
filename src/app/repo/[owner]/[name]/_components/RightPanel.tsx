'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  GitFork,
  Users,
  ExternalLink,
  AlertCircle,
  CalendarDays,
  Scale,
  Code,
  GitCommit,
  CircleCheckBig,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { RepoDetailData } from '@/types/rankings';

interface RightPanelProps {
  owner: string;
  name: string;
}

export default function RightPanel({ owner, name }: RightPanelProps) {
  const { data: repoDetail, isLoading } = useQuery<RepoDetailData>({
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
    <aside className="space-y-4">
      {isLoading ? (
        <RightPanelSkeleton />
      ) : repoDetail ? (
        <RightPanelContent repoDetail={repoDetail} />
      ) : null}
    </aside>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </dt>
      <dd className="text-xs font-medium text-foreground">{value}</dd>
    </div>
  );
}

function RightPanelContent({ repoDetail }: { repoDetail: RepoDetailData }) {
  const createdYear = new Date(repoDetail.createdAt).getFullYear();

  return (
    <>
      {/* Repo identity */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Image
            src={repoDetail.ownerAvatar}
            alt={repoDetail.owner}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {repoDetail.fullName}
            </p>
            {repoDetail.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted">{repoDetail.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Stats
        </h3>
        <dl className="space-y-2.5">
          <MetaRow
            icon={<Star className="h-3.5 w-3.5 text-amber-500" />}
            label="Stars"
            value={formatNumber(repoDetail.starCount)}
          />
          <MetaRow
            icon={<GitFork className="h-3.5 w-3.5 text-muted" />}
            label="Forks"
            value={formatNumber(repoDetail.forkCount)}
          />
          <MetaRow
            icon={<Users className="h-3.5 w-3.5 text-muted" />}
            label="Contributors"
            value={repoDetail.contributorCount > 0 ? formatNumber(repoDetail.contributorCount) : '—'}
          />
          <MetaRow
            icon={<AlertCircle className="h-3.5 w-3.5 text-muted" />}
            label="Open Issues"
            value={formatNumber(repoDetail.openIssuesCount)}
          />
        </dl>
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Info
        </h3>
        <dl className="space-y-2.5">
          {repoDetail.language && (
            <MetaRow
              icon={<Code className="h-3.5 w-3.5 text-muted" />}
              label="Language"
              value={repoDetail.language}
            />
          )}
          {repoDetail.license && (
            <MetaRow
              icon={<Scale className="h-3.5 w-3.5 text-muted" />}
              label="License"
              value={repoDetail.license}
            />
          )}
          <MetaRow
            icon={<CalendarDays className="h-3.5 w-3.5 text-muted" />}
            label="Created"
            value={String(createdYear)}
          />
        </dl>
      </div>

      {/* This week */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          This Week
        </h3>
        <dl className="space-y-2.5">
          <MetaRow
            icon={<GitCommit className="h-3.5 w-3.5 text-muted" />}
            label="Commits"
            value={repoDetail.weeklyPushCount > 0 ? String(repoDetail.weeklyPushCount) : '—'}
          />
          <MetaRow
            icon={<CircleCheckBig className="h-3.5 w-3.5 text-muted" />}
            label="Issues Closed"
            value={repoDetail.weeklyIssuesClosed > 0 ? String(repoDetail.weeklyIssuesClosed) : '—'}
          />
        </dl>
      </div>

      {/* View on GitHub */}
      <Button asChild className="w-full gap-2">
        <a
          href={repoDetail.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-4 w-4" />
          View on GitHub
        </a>
      </Button>
    </>
  );
}

function RightPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
