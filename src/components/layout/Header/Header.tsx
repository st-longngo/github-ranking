'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Leaderboard' },
  { href: '/top-ranking', label: 'Top Ranking' },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo + LIVE badge */}
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-75"
        >
          <BarChart3 className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
          <span className="hidden font-semibold tracking-tight sm:inline">
            GitHub Rankings
          </span>
          <span className="font-semibold tracking-tight sm:hidden">GL Rankings</span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-0.5" role="list">
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-accent/10 text-accent ring-1 ring-inset ring-accent/25'
                        : 'text-muted hover:bg-border/50 hover:text-foreground',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
