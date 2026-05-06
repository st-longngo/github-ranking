import type { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';
import { getLanguageRankingsFromCsv } from '@/services/csvService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageTable from './_components/LanguageTable';

export const metadata: Metadata = {
  title: 'Language Rankings',
  description:
    'Ranked list of programming languages by composite GitHub activity — repositories, stars, forks, and recent commit momentum.',
};

export const dynamic = 'force-dynamic';

export default async function LanguagePage() {
  const data = await getLanguageRankingsFromCsv();

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Language Rankings</h1>
        <p className="mt-1 text-sm text-muted">
          Ranked by composite score across repositories, stars, forks, and recent activity.
          {data ? (
            <span className="ml-1">
              Last updated:{' '}
              <time dateTime={data.dataDate} className="font-medium text-foreground">
                {data.dataDate}
              </time>
            </span>
          ) : null}
        </p>
      </div>

      {!data ? (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ranking data is temporarily unavailable. Run the daily cron job to populate data, or
            check back later.
          </AlertDescription>
        </Alert>
      ) : (
        <LanguageTable summaries={data.summaries} />
      )}
    </main>
  );
}
