'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Star, Shuffle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import RepoCard from '@/app/_components/RepoCard';
import SearchDropdown from '@/app/_components/SearchDropdown';
import FeedSkeleton from '@/app/_components/FeedSkeleton';
import type { TrendingMode, TrendingReposResponse } from '@/types/rankings';

const MODES: { value: TrendingMode; label: string; icon: React.ReactNode }[] = [
  { value: 'weekly', label: 'Trending', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { value: 'all-time', label: 'Most starred', icon: <Star className="h-3.5 w-3.5" /> },
  { value: 'random', label: 'Discover', icon: <Shuffle className="h-3.5 w-3.5" /> },
];

export default function TrendingFeed() {
  const [mode, setMode] = useState<TrendingMode>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<TrendingReposResponse>({
    queryKey: ['trending-repos', mode],
    queryFn: async () => {
      const res = await fetch(`/api/trending-repos?mode=${mode}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json() as { data: TrendingReposResponse };
      return json.data;
    },
    staleTime: mode === 'random' ? 0 : 5 * 60 * 1000,
  });

  const repos = data?.repos ?? [];

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Explore GitHub
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Discover trending repositories, top languages, and open-source projects.
        </p>
      </div>

      {/* Search */}
      <div className="relative mx-auto mb-8 max-w-xl" ref={dropdownRef}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
          onKeyDown={(e) => e.key === 'Escape' && setShowDropdown(false)}
          placeholder="Search repositories…"
          className="h-10 rounded-lg border-border bg-surface pl-9 pr-9 text-sm shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {showDropdown && searchQuery.length >= 2 && (
          <SearchDropdown query={searchQuery} onClose={() => setShowDropdown(false)} />
        )}
      </div>

      {/* Mode tabs */}
      <div className="mb-6 flex items-center gap-1 border-b border-border">
        {MODES.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={`-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm transition-colors ${
              mode === value
                ? 'border-accent font-medium text-foreground'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <FeedSkeleton />
      ) : repos.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted">
          No repositories found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {repos.map((repo) => (
            <RepoCard
              key={repo.fullName}
              repo={repo}
              rank={repo.rank}
              showDelta={mode === 'weekly'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
