import { NextRequest, NextResponse } from 'next/server';
import { getPersonAvatars } from '@/lib/services/person-avatar';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const namesParam = searchParams.get('names') || '';
  const names = namesParam
    .split(/[,，]/)
    .map(n => n.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return NextResponse.json({ success: true, avatars: {} });
  }

  const avatars = await getPersonAvatars(names);

  return NextResponse.json(
    { success: true, avatars },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    }
  );
}
