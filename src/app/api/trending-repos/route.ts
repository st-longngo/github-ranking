import { getTrendingRepos } from '@/services/trending';
import type { TrendingMode } from '@/types/rankings';

export const dynamic = 'force-dynamic';

const VALID_MODES = new Set<TrendingMode>(['weekly', 'all-time', 'random']);

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'weekly';

    if (!VALID_MODES.has(mode as TrendingMode)) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: `Invalid mode: ${mode}. Must be one of: weekly, all-time, random` } },
        { status: 400 },
      );
    }

    const data = await getTrendingRepos(mode as TrendingMode);
    return Response.json({ data });
  } catch (error) {
    console.error('[api/trending-repos] Error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trending repos' } },
      { status: 500 },
    );
  }
}
