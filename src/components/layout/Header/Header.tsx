'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SettingsMenu from './SettingsMenu';

const NAV_ITEMS = [
  { href: '/', label: 'Explore' },
  { href: '/top-ranking', label: 'Top Ranking' },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
            {/* Ascending bars — ranking leaderboard */}
            <rect x="1" y="13" width="3" height="6.5" rx="1" fill="currentColor" fillOpacity="0.4" />
            <rect x="5.5" y="9" width="3" height="10.5" rx="1" fill="currentColor" fillOpacity="0.7" />
            <rect x="10" y="4.5" width="3" height="15" rx="1" fill="currentColor" />
            {/* Pulse spike — real-time activity */}
            <path
              d="M14 9 L15 9 L15.8 6 L17.2 13 L18 9 L19 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight">
            GitPulse
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Primary navigation" className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-surface font-medium text-foreground'
                    : 'text-muted hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Settings — pushed to the right */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/st-longngo/github-ranking"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="rounded-md p-1.5 text-muted transition-colors hover:text-foreground"
          >
            <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
          </a>
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
