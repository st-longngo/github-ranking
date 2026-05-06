import { getLanguageMetrics } from '@/services/github';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/refresh-rankings
 *
 * Warms / refreshes the per-language metrics cache.
 * Call this on a schedule (e.g. every 4 minutes via Vercel Cron or an external scheduler)
 * so user-facing requests always hit a warm cache and never wait for live GitHub API calls.
 *
 * Secured with CRON_SECRET to prevent unauthenticated triggers.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } }, { status: 401 });
    }
  }

  const start = Date.now();
  try {
    const { metrics, isStale } = await getLanguageMetrics();
    const elapsed = Date.now() - start;
    return Response.json({
      data: {
        refreshed: metrics.length,
        isStale,
        elapsedMs: elapsed,
      },
    });
  } catch (error) {
    const elapsed = Date.now() - start;
    console.error('[cron/refresh-rankings] Failed:', error);
    return Response.json(
      { error: { code: 'REFRESH_FAILED', message: 'Cache refresh failed' }, meta: { elapsedMs: elapsed } },
      { status: 500 },
    );
  }
}
