'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, isFetching, onPageChange }: PaginationProps) {
  const pages = getPageItems(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || isFetching}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
            disabled={isFetching}
            className="min-w-8"
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isFetching}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getPageItems(current: number, total: number): (number | '...')[] {
  const delta = 2;
  const start = Math.max(1, current - delta);
  const end = Math.min(total, current + delta);
  const items: (number | '...')[] = [];

  if (start > 1) items.push('...');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total) items.push('...');

  return items;
}
