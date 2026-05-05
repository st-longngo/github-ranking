'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Key, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGitHubToken } from '@/hooks/useGitHubToken';
import AccessTokenModal from '@/components/layout/Header/AccessTokenModal';

export default function SettingsMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { hasToken } = useGitHubToken();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && dropdownOpen) setDropdownOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  return (
    <div className="relative ml-auto" ref={dropdownRef}>
      {/* Settings icon button */}
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={cn(
          'relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground',
          dropdownOpen && 'bg-surface text-foreground',
        )}
        aria-label="Settings"
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
      >
        <Settings className="h-4 w-4" />
        {hasToken && (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-live"
            aria-label="GitHub token active"
          />
        )}
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <button
            role="menuitem"
            onClick={() => { setDropdownOpen(false); setModalOpen(true); }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface"
          >
            <Key className="h-3.5 w-3.5 shrink-0 text-muted" />
            Add Access Token
            {hasToken && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-live" />
            )}
          </button>

          <div className="h-px bg-border" role="separator" />

          <Link
            href="/how-to-use"
            role="menuitem"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted" />
            How to use this site
          </Link>
        </div>
      )}

      {/* Access Token Modal */}
      <AccessTokenModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
