'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Star,
  ExternalLink,
  Tag,
  RefreshCw,
  Package,
  GitBranch,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type {
  RepoRelease,
  RepoReleasesResponse,
  RepoSearchResult,
  StarDataPoint,
} from '@/types/rankings';

interface RepoExplorerProps {
  selectedRepo: string | null;
  onSelectRepo: (fullName: string) => void;
}

export default function RepoExplorer({ selectedRepo, onSelectRepo }: RepoExplorerProps) {
  const [searchQuery, setSearchQuery] = useState(selectedRepo ?? '');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [prevSelectedRepo, setPrevSelectedRepo] = useState(selectedRepo);

  // Sync search input when selectedRepo changes from an external source (e.g. sidebar click).
  // React-recommended pattern: setState during render for derived state adjustments.
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (prevSelectedRepo !== selectedRepo) {
    setPrevSelectedRepo(selectedRepo);
    setSearchQuery(selectedRepo ?? '');
    setShowDropdown(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowDropdown(value.length >= 2);
  }, []);

  const handleSelectFromSearch = useCallback(
    (fullName: string) => {
      onSelectRepo(fullName);
      setSearchQuery(fullName);
      setShowDropdown(false);
    },
    [onSelectRepo],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = searchQuery.trim();
        if (trimmed.includes('/')) handleSelectFromSearch(trimmed);
      }
      if (e.key === 'Escape') setShowDropdown(false);
    },
    [searchQuery, handleSelectFromSearch],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="border-b border-border p-3" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            placeholder="Search a repository (e.g. facebook/react)"
            className="pl-9"
          />
          {showDropdown && searchQuery.length >= 2 && (
            <SearchDropdown query={searchQuery} onSelect={handleSelectFromSearch} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedRepo ? <RepoDetail repoFullName={selectedRepo} /> : <EmptyState />}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 rounded-full bg-accent/10 p-4">
        <GitBranch className="h-8 w-8 text-accent" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Explore GitHub Repositories</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Search for any public repository or select one from the sidebar to view its star history
        and latest releases.
      </p>
    </div>
  );
}

function SearchDropdown({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (fullName: string) => void;
}) {
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
    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
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
          {results.map((result) => (
            <li key={result.fullName}>
              <button
                onClick={() => onSelect(result.fullName)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-border/30"
              >
                <Image
                  src={result.ownerAvatar}
                  alt={result.fullName}
                  className="h-5 w-5 rounded-full"
                  width={20}
                  height={20}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{result.fullName}</p>
                  {result.description && (
                    <p className="truncate text-xs text-muted">{result.description}</p>
                  )}
                </div>
                <span className="flex shrink-0 items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                  <Star className="h-3 w-3" />
                  {formatNumber(result.starCount)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RepoDetail({ repoFullName }: { repoFullName: string }) {
  const slashIdx = repoFullName.indexOf('/');
  const owner = repoFullName.slice(0, slashIdx);
  const repo = repoFullName.slice(slashIdx + 1);

  if (!owner || !repo) return null;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="p-5">
        <StarHistoryChart owner={owner} repo={repo} />
      </div>
      <div className="border-t border-border p-5">
        <ReleaseList owner={owner} repo={repo} />
      </div>
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-surface px-3 py-2 text-xs shadow-lg ring-1 ring-border">
      <p className="text-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-amber-500">★ {formatNumber(payload[0].value)}</p>
    </div>
  );
}

function formatXDate(dateStr: string): string {
  return String(new Date(dateStr).getFullYear());
}

function StarHistoryChart({ owner, repo }: { owner: string; repo: string }) {
  const { data, isLoading, isError } = useQuery<StarDataPoint[]>({
    queryKey: ['repo-stars', owner, repo],
    queryFn: async () => {
      const res = await fetch(
        `/api/repo-stars?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
      );
      if (!res.ok) return [];
      const json = (await res.json()) as { data: StarDataPoint[] };
      return json.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const points = data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold">Star History</h3>
        <a
          href={`https://github.com/${owner}/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted transition-colors hover:text-accent"
        >
          — {owner}/{repo}
        </a>
      </div>

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-lg" />
      ) : isError || points.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-lg bg-background/50 text-center">
          <Star className="h-6 w-6 text-muted" />
          <p className="mt-2 text-sm text-muted">No star history available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={points} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(107,114,128,0.12)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXDate}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatNumber}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="stars"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#starGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', stroke: 'transparent' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Releases ─────────────────────────────────────────────────

function ReleaseList({ owner, repo }: { owner: string; repo: string }) {
  const { data, isLoading, isError, refetch } = useQuery<RepoReleasesResponse>({
    queryKey: ['repo-releases', owner, repo],
    queryFn: async () => {
      const res = await fetch(
        `/api/repo-releases?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
      );
      if (!res.ok) throw new Error('Failed to fetch releases');
      const json = (await res.json()) as { data: RepoReleasesResponse };
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const releases = data?.releases ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Package className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold">Releases latest</h3>
        {releases.length > 0 && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            {releases.length}
          </span>
        )}
        <a
          href={`https://github.com/${owner}/${repo}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-accent"
        >
          <ExternalLink className="h-3 w-3" />
          Show all
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-muted">Failed to load releases</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      ) : releases.length === 0 ? (
        <div className="py-10 text-center">
          <Package className="mx-auto h-6 w-6 text-muted" />
          <p className="mt-2 text-sm text-muted">No releases found for this repository.</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 divide-y-0">
            {releases.map((release) => (
              <ReleaseItem key={release.tagName} release={release} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ReleaseItem({ release }: { release: RepoRelease }) {
  return (
    <li className="group border-b border-border/30 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Tag className="h-3 w-3 shrink-0 text-accent" />
            <span className="font-mono text-sm font-semibold text-foreground">
              {release.tagName}
            </span>
          </div>
          {release.name && release.name !== release.tagName && (
            <p className="mt-0.5 truncate text-xs text-muted">{release.name}</p>
          )}
        </div>

        <a
          href={release.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 shrink-0 rounded p-1 text-muted opacity-0 transition-all hover:text-accent group-hover:opacity-100"
          aria-label={`View ${release.tagName} on GitHub`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </li>
  );
}
