import { type NextRequest } from 'next/server';
import { getLanguageRanking } from '@/services/rankings';
import { fromLanguageSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const languageName = fromLanguageSlug(slug);
  if (!languageName) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: `Unknown language slug: ${slug}` } },
      { status: 404 },
    );
  }

  try {
    const { language, isStale, rateLimitResetAt } = await getLanguageRanking(slug);

    if (!language) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: `Language not found: ${slug}` } },
        { status: 404 },
      );
    }

    return Response.json({
      data: language,
      meta: {
        isStale,
        fetchedAt: new Date().toISOString(),
        ...(rateLimitResetAt && { rateLimitResetAt }),
      },
    });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch language ranking' } },
      { status: 500 },
    );
  }
}
