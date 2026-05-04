import { getRepoReleases } from '@/lib/trending';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner')?.trim();
    const repo = searchParams.get('repo')?.trim();

    if (!owner || !repo) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Both owner and repo query params are required' } },
        { status: 400 },
      );
    }

    // Basic validation: only allow alphanumeric, hyphens, underscores, dots
    const namePattern = /^[a-zA-Z0-9._-]+$/;
    if (!namePattern.test(owner) || !namePattern.test(repo)) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid owner or repo name' } },
        { status: 400 },
      );
    }

    const data = await getRepoReleases(owner, repo);
    return Response.json({ data });
  } catch (error) {
    console.error('[api/repo-releases] Error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch releases' } },
      { status: 500 },
    );
  }
}
