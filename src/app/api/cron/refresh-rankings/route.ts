import { fetchAllLanguagesRaw } from '@/services/cronFetcher';
import { writeCsvFile } from '@/services/csvService';

export const dynamic = 'force-dynamic';
// Allow up to 300s — fetching 30 languages with 5-concurrent + 2s batch delay takes ~60s on cold start
export const maxDuration = 300;

/**
 * GET /api/cron/refresh-rankings
 *
 * Fetches the top-100 repositories for every supported language from GitHub,
 * then writes the results to a dated CSV file and updates `latest.csv`.
 *
 * Trigger daily at 00:00 UTC via Vercel Cron (configured in vercel.json).
 */
export async function GET() {
  const start = Date.now();
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    const { records, errors, tokensUsed, fromCache } = await fetchAllLanguagesRaw();

    if (records.length === 0) {
      return Response.json(
        { error: { code: 'NO_DATA', message: 'GitHub API returned no records' } },
        { status: 502 },
      );
    }

    await writeCsvFile(records, date);

    return Response.json({
      data: {
        date,
        recordsWritten: records.length,
        languagesFromCache: fromCache,
        languagesWithErrors: errors.length,
        tokensUsed,
        errors,
        elapsedMs: Date.now() - start,
      },
    });
  } catch (error) {
    console.error('[cron/refresh-rankings] Failed:', error);
    return Response.json(
      {
        error: {
          code: 'CRON_FAILED',
          message: 'Cron job failed unexpectedly',
          detail: error instanceof Error ? error.message : String(error),
        },
        meta: { elapsedMs: Date.now() - start },
      },
      { status: 500 },
    );
  }
}
