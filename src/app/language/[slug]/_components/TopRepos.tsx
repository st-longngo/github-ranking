import Link from 'next/link';
import type { CsvRepoRecord } from '@/types/csvRankings';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { Star, GitFork } from 'lucide-react';

interface TopReposProps {
  repos: CsvRepoRecord[];
}

export default function TopRepos({ repos }: TopReposProps) {
  if (repos.length === 0) return null;

  return (
    <section aria-labelledby="repos-heading">
      <h2 id="repos-heading" className="mb-3 text-base font-semibold text-foreground">
        Top Repositories
      </h2>
      <ul className="space-y-2" role="list">
        {repos.map((repo, i) => (
          <li key={repo.item}>
            <Link
              href={`/repo/${repo.item}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface/40 px-4 py-3 transition-colors hover:bg-surface"
            >
              <span className="w-6 shrink-0 text-center text-xs font-medium text-muted tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{repo.item}</p>
                {repo.repoDescription && (
                  <p className="truncate text-xs text-muted">{repo.repoDescription}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formatNumber(repo.stars)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formatNumber(repo.forks)}</span>
                </span>
                <span className="hidden sm:block">{formatRelativeTime(repo.lastCommit)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
