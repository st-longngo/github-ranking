import { searchRepos } from '@/services/trending';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() ?? '';

    if (query.length < 2) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Query must be at least 2 characters' } },
        { status: 400 },
      );
    }

    const data = await searchRepos(query);
    return Response.json({ data });
  } catch (error) {
    console.error('[api/repo-search] Error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to search repos' } },
      { status: 500 },
    );
  }
}
