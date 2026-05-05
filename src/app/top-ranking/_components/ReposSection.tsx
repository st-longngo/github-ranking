'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import type { TopReposPage, RepoItem } from '@/types/rankings';

interface ReposSectionProps {
  repos: RepoItem[];
}

export default function ReposSection({ repos }: ReposSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {repos.map((repo, i) => (
        <Link
          key={repo.fullName}
          href={`/repo/${repo.fullName}`}
          className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface ${i < repos.length - 1 ? 'border-b border-border' : ''}`}
        >
          <span className="w-6 text-right font-mono text-sm text-muted">{repo.rank}</span>

          {repo.ownerAvatar ? (
            <Image
              src={repo.ownerAvatar}
              alt={repo.fullName}
              className="h-7 w-7 rounded-full"
              width={28}
              height={28}
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-border" />
          )}

          <span className="flex-1 truncate text-sm font-medium text-foreground">{repo.fullName}</span>

          <span className="flex shrink-0 items-center gap-1 text-sm tabular-nums text-amber-600 dark:text-amber-400">
            <Star className="h-3.5 w-3.5" />
            {formatNumber(repo.starCount)}
          </span>
        </Link>
      ))}
    </div>
  );
}
