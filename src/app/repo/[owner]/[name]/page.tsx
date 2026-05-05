import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RepoDetailClient from '@/app/repo/[owner]/[name]/_components/RepoDetailClient';

const NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

interface Props {
  params: Promise<{ owner: string; name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, name } = await params;
  return {
    title: `${owner}/${name} — GitHub Ranking`,
    description: `Repository stats and star history for ${owner}/${name}.`,
  };
}

export default async function RepoDetailPage({ params }: Props) {
  const { owner, name } = await params;

  if (!NAME_PATTERN.test(owner) || !NAME_PATTERN.test(name)) {
    notFound();
  }

  return <RepoDetailClient owner={owner} name={name} />;
}
