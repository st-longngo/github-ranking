import { getRankings } from '@/lib/rankings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getRankings();
    return Response.json({ data });
  } catch (error) {
    console.error('[api/rankings] Error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rankings' } },
      { status: 500 },
    );
  }
}
