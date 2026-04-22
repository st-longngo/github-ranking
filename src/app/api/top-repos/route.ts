import { type NextRequest } from 'next/server';
import { getTopRepos, type TopRepoType } from '@/lib/github';

const VALID_TYPES = new Set<string>(['stars', 'forks', 'trending']);

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? '';
  const rawPage = req.nextUrl.searchParams.get('page') ?? '1';

  if (!VALID_TYPES.has(type)) {
    return Response.json(
      { error: { code: 'BAD_REQUEST', message: 'type must be one of: stars, forks, trending' } },
      { status: 400 },
    );
  }

  const page = parseInt(rawPage, 10);
  if (!Number.isInteger(page) || page < 1 || page > 50) {
    return Response.json(
      { error: { code: 'BAD_REQUEST', message: 'page must be an integer between 1 and 50' } },
      { status: 400 },
    );
  }

  const result = await getTopRepos(type as TopRepoType, page);

  return Response.json(
    { data: result, meta: { page, perPage: 20 } },
  );
}

