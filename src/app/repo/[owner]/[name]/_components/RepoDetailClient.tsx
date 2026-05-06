'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NearbyRanksSidebar from '@/app/repo/[owner]/[name]/_components/NearbyRanksSidebar';
import CenterPanel from '@/app/repo/[owner]/[name]/_components/CenterPanel';
import RightPanel from '@/app/repo/[owner]/[name]/_components/RightPanel';

interface RepoDetailClientProps {
  owner: string;
  name: string;
}

export default function RepoDetailClient({ owner, name }: RepoDetailClientProps) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr_280px]">
        {/* Left sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <NearbyRanksSidebar currentOwner={owner} currentName={name} />
        </div>

        {/* Centre content */}
        <CenterPanel owner={owner} name={name} />

        {/* Right info panel */}
        <RightPanel owner={owner} name={name} />
      </div>

      {/* Mobile: nearby sidebar below everything */}
      <div className="mt-6 lg:hidden">
        <NearbyRanksSidebar currentOwner={owner} currentName={name} />
      </div>
    </div>
  );
}
