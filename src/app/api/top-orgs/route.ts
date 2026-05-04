import { type NextRequest } from 'next/server';
import { getTopOrgs } from '@/lib/github';

export async function GET(req: NextRequest) {
  const rawPage = req.nextUrl.searchParams.get('page') ?? '1';

  const page = parseInt(rawPage, 10);
  if (!Number.isInteger(page) || page < 1 || page > 50) {
    return Response.json(
      { error: { code: 'BAD_REQUEST', message: 'page must be an integer between 1 and 50' } },
      { status: 400 },
    );
  }

  const result = await getTopOrgs(page);

  return Response.json(
    { data: result, meta: { page, perPage: 50 } },
  );
}
