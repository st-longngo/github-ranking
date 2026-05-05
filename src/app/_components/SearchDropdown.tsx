'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { RepoSearchResult } from '@/types/rankings';

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
}

export default function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const { data, isLoading } = useQuery<RepoSearchResult[]>({
    queryKey: ['repo-search', query],
    queryFn: async () => {
      const res = await fetch(`/api/repo-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const json = (await res.json()) as { data: RepoSearchResult[] };
      return json.data;
    },
    staleTime: 30_000,
  });

  const results = data ?? [];

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
      {isLoading ? (
        <div className="space-y-2 p-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="px-3 py-4 text-center text-sm text-muted">No repositories found</div>
      ) : (
        <ul role="listbox">
          {results.map((result) => {
            const [rOwner, rName] = result.fullName.split('/');
            return (
              <li key={result.fullName}>
                <Link
                  href={`/repo/${rOwner}/${rName}`}
                  onClick={onClose}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface"
                >
                  <Image
                    src={result.ownerAvatar}
                    alt=""
                    className="h-6 w-6 rounded-full"
                    width={24}
                    height={24}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{result.fullName}</p>
                    {result.description && (
                      <p className="truncate text-xs text-muted">{result.description}</p>
                    )}
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3" />
                    {formatNumber(result.starCount)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
