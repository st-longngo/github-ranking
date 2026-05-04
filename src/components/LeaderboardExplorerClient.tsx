'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrendingSidebar from '@/components/TrendingSidebar';
import RepoExplorer from '@/components/RepoExplorer';
import { cn } from '@/lib/utils';

export default function LeaderboardExplorerClient() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleSelectRepo(fullName: string) {
    setSelectedRepo(fullName);
    setSidebarOpen(false); // Close mobile drawer on selection
  }

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] gap-0 overflow-hidden lg:h-[calc(100vh-3.5rem-2rem)] lg:gap-3 lg:px-4 lg:py-4 max-w-7xl mx-auto">
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 left-4 z-50 h-10 w-10 rounded-full shadow-lg lg:hidden"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <div
        className={cn(
          'shrink-0 transition-transform duration-200',
          // Desktop: always visible
          'hidden lg:block lg:w-72 lg:overflow-hidden lg:rounded-xl lg:border lg:border-border',
          // Mobile: overlay drawer
          sidebarOpen && 'fixed inset-y-0 left-0 z-40 block w-72 shadow-xl lg:relative lg:shadow-none',
        )}
      >
        <TrendingSidebar
          selectedRepo={selectedRepo}
          onSelectRepo={handleSelectRepo}
        />
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main explorer panel */}
      <div className="flex-1 overflow-hidden lg:rounded-xl lg:border lg:border-border">
        <RepoExplorer
          selectedRepo={selectedRepo}
          onSelectRepo={handleSelectRepo}
        />
      </div>
    </div>
  );
}
