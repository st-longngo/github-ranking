import { type NextRequest } from 'next/server';
import { getLanguageRepos } from '@/lib/github';
import { fromLanguageSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return Response.json({ error: { code: 'BAD_REQUEST', message: 'slug is required' } }, { status: 400 });
  }

  const languageName = fromLanguageSlug(slug);
  if (!languageName) {
    return Response.json({ error: { code: 'NOT_FOUND', message: `Unknown language slug: ${slug}` } }, { status: 404 });
  }

  try {
    const repos = await getLanguageRepos(languageName);
    return Response.json({ data: repos });
  } catch {
    return Response.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch repos' } }, { status: 500 });
  }
}
