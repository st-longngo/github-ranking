'use client';

import Image from 'next/image';
import { Star, GitFork, Users } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import type { RepoDetailData } from '@/types/rankings';

const RADAR_CAPS = {
  stars: 200_000,
  forks: 50_000,
  newPushes: 100,
  contributors: 500,
  openIssues: 5_000,
} as const;

function normalize(value: number, cap: number): number {
  if (cap === 0) return 0;
  return Math.min(100, Math.round((value / cap) * 100));
}

function StatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface p-3 text-center">
      {icon}
      <span className="text-base font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

interface OverviewTabProps {
  repoDetail: RepoDetailData;
}

export default function OverviewTab({ repoDetail }: OverviewTabProps) {
  const radarData = [
    { subject: 'Stars', value: normalize(repoDetail.starCount, RADAR_CAPS.stars) },
    { subject: 'Forks', value: normalize(repoDetail.forkCount, RADAR_CAPS.forks) },
    { subject: 'Pushes', value: normalize(repoDetail.weeklyPushCount, RADAR_CAPS.newPushes) },
    { subject: 'Contributors', value: normalize(repoDetail.contributorCount, RADAR_CAPS.contributors) },
    { subject: 'Issues', value: normalize(repoDetail.openIssuesCount, RADAR_CAPS.openIssues) },
  ];

  return (
    <div className="space-y-6">
      {/* Repo header */}
      <div className="flex items-start gap-3">
        <Image
          src={repoDetail.ownerAvatar}
          alt={repoDetail.owner}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full"
        />
        <div>
          <h1 className="text-lg font-medium leading-tight">
            <span className="text-muted">{repoDetail.owner}</span>
            <span className="mx-1 text-muted">/</span>
            <span className="font-bold text-foreground">{repoDetail.name}</span>
          </h1>
          {repoDetail.description && (
            <p className="mt-1 text-sm text-muted">{repoDetail.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {repoDetail.language && (
              <Badge variant="secondary" className="text-xs">
                {repoDetail.language}
              </Badge>
            )}
            {repoDetail.license && (
              <Badge variant="outline" className="text-xs">
                {repoDetail.license}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Radar chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(107,114,128,0.2)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            />
            <Radar
              name={repoDetail.fullName}
              dataKey="value"
              stroke="var(--color-accent)"
              fill="var(--color-accent)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCell icon={<Star className="h-4 w-4 text-amber-500" />} label="Stars" value={formatNumber(repoDetail.starCount)} />
        <StatCell icon={<GitFork className="h-4 w-4 text-muted" />} label="Forks" value={formatNumber(repoDetail.forkCount)} />
        <StatCell icon={<Users className="h-4 w-4 text-muted" />} label="Contributors" value={repoDetail.contributorCount > 0 ? formatNumber(repoDetail.contributorCount) : '—'} />
      </div>
    </div>
  );
}
