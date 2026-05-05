'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import type { TrendingRepo } from '@/types/rankings';

interface RepoCardProps {
  repo: TrendingRepo;
  rank: number;
  showDelta?: boolean;
  onSelect?: (fullName: string) => void;
}

export default function RepoCard({ repo, rank, showDelta, onSelect }: RepoCardProps) {
  const router = useRouter();
  const [owner, name] = repo.fullName.split('/');
  const detailHref = `/repo/${owner}/${name}`;

  function handleCardClick() {
    onSelect?.(repo.fullName);
    router.push(detailHref);
  }

  return (
    <article
      className="group cursor-pointer border-b border-border px-4 py-4 transition-colors hover:bg-surface sm:px-6"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        {/* Rank number */}
        <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-sm text-muted">
          {rank}
        </span>

        {/* Avatar */}
        <Image
          src={repo.ownerAvatar}
          alt=""
          className="mt-0.5 h-8 w-8 shrink-0 rounded-full"
          width={32}
          height={32}
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-foreground group-hover:text-accent">
              {repo.fullName}
            </h3>
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${repo.fullName} on GitHub`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {repo.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">
              {repo.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Star className="h-3.5 w-3.5" />
              {formatNumber(repo.starCount)}
            </span>

            {showDelta && repo.weeklyStarDelta > 0 && (
              <span className="inline-flex items-center gap-0.5 font-medium text-live">
                +{formatNumber(repo.weeklyStarDelta)} this week
              </span>
            )}

            <span className="inline-flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              {formatNumber(repo.forkCount)}
            </span>

            <span>Updated {formatRelativeTime(repo.pushedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
