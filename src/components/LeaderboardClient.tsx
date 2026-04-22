'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ArrowUpDown, X, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LanguageRanking, RankingResponse } from '@/types/rankings';
import { LANGUAGE_CATEGORIES, METRIC_LABELS } from '@/types/rankings';
import { formatNumber, cn } from '@/lib/utils';
import RankBadge from '@/components/ui/RankBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

interface LeaderboardClientProps {
  /** Server-side pre-fetched data shown immediately — hydrated before client JS runs */
  initialData: RankingResponse;
}

function ActivityDot({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-live' : score >= 35 ? 'bg-warning' : 'bg-critical';
  return <span className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', color)} aria-hidden="true" />;
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />;
  if (sorted === 'desc') return <ArrowDown className="h-3 w-3 text-accent" aria-hidden="true" />;
  return <ArrowUp className="h-3 w-3 text-accent" aria-hidden="true" />;
}

const columnHelper = createColumnHelper<LanguageRanking>();

const columns = [
  columnHelper.accessor('rank', {
    header: 'Rank',
    enableSorting: false,
    cell: info => <RankBadge rank={info.getValue()} />,
  }),
  columnHelper.accessor('name', {
    header: 'Language',
    enableSorting: false,
    cell: info => <span className="font-semibold">{info.getValue()}</span>,
  }),
  columnHelper.accessor('compositeScore', {
    id: 'composite',
    header: METRIC_LABELS.composite,
    sortDescFirst: true,
    cell: info => (
      <span className={cn('font-bold text-accent', info.row.original.rank <= 5 && 'metric-glow')}>
        {info.getValue().toFixed(1)}
      </span>
    ),
  }),
  columnHelper.accessor('repositoryCount', {
    id: 'repositories',
    header: METRIC_LABELS.repositories,
    sortDescFirst: true,
    cell: info => <span className="text-muted">{formatNumber(info.getValue())}</span>,
  }),
  columnHelper.accessor('starCount', {
    id: 'stars',
    header: METRIC_LABELS.stars,
    sortDescFirst: true,
    cell: info => (
      <span className="text-amber-600 dark:text-amber-400">{formatNumber(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor('forkCount', {
    id: 'forks',
    header: METRIC_LABELS.forks,
    sortDescFirst: true,
    cell: info => <span className="text-muted">{formatNumber(info.getValue())}</span>,
  }),
  columnHelper.accessor('activityCount', {
    id: 'activity',
    header: 'Activity 30d',
    sortDescFirst: true,
    cell: info => (
      <span className="inline-flex items-center justify-end gap-1.5">
        <ActivityDot score={info.row.original.normalized.activity} />
        <span className="text-live">{formatNumber(info.getValue())}</span>
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: info => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/language/${info.row.original.slug}`}>View →</Link>
      </Button>
    ),
  }),
];

export default function LeaderboardClient({ initialData }: LeaderboardClientProps) {
  const [sorting, setSorting]             = useState<SortingState>([{ id: 'composite', desc: true }]);
  const [globalFilter, setGlobalFilter]   = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // TanStack Query — refetches every 5 min; initialData shown immediately from SSR
  const { data, isFetching, dataUpdatedAt } = useQuery<RankingResponse>({
    queryKey: ['rankings'],
    queryFn: async () => {
      const res = await fetch('/api/rankings');
      if (!res.ok) throw new Error('Failed to fetch rankings');
      const json = (await res.json()) as { data: RankingResponse };
      return json.data;
    },
    initialData,
    refetchInterval: (query) => {
      // If rate-limited, wait until the reset time before refetching
      const resetAt = query.state.data?.rateLimitResetAt;
      if (resetAt) {
        const msUntilReset = new Date(resetAt).getTime() - Date.now();
        return Math.max(msUntilReset + 5_000, 60_000);
      }
      return 5 * 60 * 1000; // 30 min — match server cache TTL
    },
  });

  const { rankings, rateLimitResetAt } = data;

  const categoryFiltered = useMemo(() => {
    if (selectedCategories.length === 0) return rankings;
    const names = new Set(selectedCategories.flatMap(cat => LANGUAGE_CATEGORIES[cat] ?? []));
    return rankings.filter(r => names.has(r.name));
  }, [rankings, selectedCategories]);

  const table = useReactTable({
    data: categoryFiltered,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  });

  const rows = table.getRowModel().rows;

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat],
    );
  }

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-3">
      {rateLimitResetAt && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            GitHub API rate limit exceeded. Showing cached data. Resets at{' '}
            <span className="font-mono font-semibold">
              {new Date(rateLimitResetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <label htmlFor="lang-search" className="sr-only">Filter languages</label>
          <Input
            id="lang-search"
            type="search"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Filter languages…"
            className="w-full max-w-xs sm:w-56"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGlobalFilter('')}
              aria-label="Clear filter"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="shrink-0 font-mono text-xs text-muted">
          {rows.length}/{rankings.length} languages ·{' '}
          {isFetching ? (
            <span className="text-accent">updating…</span>
          ) : updatedAt ? (
            <span><span className="text-live">●</span> {updatedAt}</span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
        {Object.keys(LANGUAGE_CATEGORIES).map(cat => (
          <Button
            key={cat}
            variant={selectedCategories.includes(cat) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleCategory(cat)}
            aria-pressed={selectedCategories.includes(cat)}
            className="h-6 rounded-full px-2.5 py-0.5 text-xs"
          >
            {cat}
          </Button>
        ))}
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategories([])}
            className="h-6 rounded-full px-2.5 py-0.5 text-xs"
          >
            Clear <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="table-scroll overflow-x-auto rounded-xl border border-border bg-surface">
        <Table aria-label="Language rankings" className="min-w-160">
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="border-b border-border text-left hover:bg-transparent">
                {hg.headers.map(header => {
                  const canSort  = header.column.getCanSort();
                  const sorted   = header.column.getIsSorted();
                  const isNumeric = header.index >= 2;
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted === 'desc' ? 'descending' : sorted === 'asc' ? 'ascending' : canSort ? 'none' : undefined}
                      className={cn(isNumeric && 'text-right')}
                    >
                      {canSort ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'flex w-full cursor-pointer items-center justify-end gap-1.5 transition-colors duration-150',
                            sorted ? 'text-accent' : 'hover:text-foreground',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon sorted={sorted} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-4 py-16 text-center text-sm text-muted">
                  No languages match &ldquo;{globalFilter}&rdquo;
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'font-mono tabular-nums',
                        cell.column.id !== 'rank' && cell.column.id !== 'name' && cell.column.id !== 'actions'
                          ? 'text-right'
                          : '',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted">
        Activity counts repos pushed in the last 30 days (top 100 by stars per language).{' '}
        Score weights:{' '}
        {Object.entries(METRIC_LABELS).filter(([k]) => k !== 'composite').map(([, v]) => v).join(', ')}.
      </p>
    </div>
  );
}
