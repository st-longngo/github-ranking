'use client';

import Image from 'next/image';
import { formatNumber } from '@/lib/utils';
import type { TopOrgItem } from '@/types/rankings';

interface OrgsSectionProps {
  orgs: TopOrgItem[];
}

export default function OrgsSection({ orgs }: OrgsSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {orgs.map((org, i) => (
        <a
          key={org.login}
          href={org.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface ${i < orgs.length - 1 ? 'border-b border-border' : ''}`}
        >
          <span className="w-6 text-right font-mono text-sm text-muted">{org.rank}</span>
          <Image
            src={org.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full"
            width={28}
            height={28}
          />
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {org.login}
          </span>
          <span className="text-sm tabular-nums text-muted">
            {formatNumber(org.followers)} followers
          </span>
        </a>
      ))}
    </div>
  );
}
