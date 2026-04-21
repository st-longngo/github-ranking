'use client';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { RepoItem } from '@/types/rankings';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

interface LanguageReposClientProps {
  slug: string;
}

const PAGE_SIZE = 10;

const columnHelper = createColumnHelper<RepoItem>();

const columns = [
  columnHelper.accessor('fullName', {
    header: 'Repository',
    cell: info => (
      <a
        href={info.row.original.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-accent hover:underline"
      >
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: info => (
      <span className="line-clamp-1 max-w-xs text-muted">
        {info.getValue() ?? '—'}
      </span>
    ),
  }),
  columnHelper.accessor('starCount', {
    header: 'Stars',
    cell: info => (
      <span className="font-mono text-amber-600 dark:text-amber-400">
        {info.getValue().toLocaleString()}
      </span>
    ),
  }),
  columnHelper.accessor('forkCount', {
    header: 'Forks',
    cell: info => (
      <span className="font-mono text-muted">{info.getValue().toLocaleString()}</span>
    ),
  }),
  columnHelper.accessor('pushedAt', {
    header: 'Last Push',
    cell: info => (
      <span className="font-mono text-xs text-muted">
        {info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '—'}
      </span>
    ),
  }),
];

function ReposLoadingSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading repositories">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-2.5">
          <div className="flex gap-8">
            {[32, 64, 16, 16, 24].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
        </div>
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 border-b border-border px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LanguageReposClient({ slug }: LanguageReposClientProps) {
  const { data, isLoading, error } = useQuery<RepoItem[]>({
    queryKey: ['language-repos', slug],
    queryFn: async () => {
      const res = await fetch(`/api/language-repos?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error('Failed to fetch repositories');
      const json = (await res.json()) as { data: RepoItem[] };
      return json.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  if (isLoading) return <ReposLoadingSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive" className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load top repositories. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">No repositories found for this language.</p>
    );
  }

  const { pageIndex } = table.getState().pagination;
  const pageCount     = table.getPageCount();

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <Table aria-label="Top repositories" className="min-w-160">
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <span>
          Page {pageIndex + 1} of {pageCount} · {data.length} repositories
        </span>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
            className="h-7 w-7"
          >
            <ChevronFirst className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
            className="h-7 w-7"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
            className="h-7 w-7"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
            className="h-7 w-7"
          >
            <ChevronLast className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
