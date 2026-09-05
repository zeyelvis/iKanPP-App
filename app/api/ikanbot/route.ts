import { NextRequest, NextResponse } from 'next/server';
import { getIkanbotVideo, fetchIkanbotDetail } from '@/lib/server/ikanbot';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || searchParams.get('q');
  const id = searchParams.get('id');
  const yearParam = searchParams.get('year');
  const seasonParam = searchParams.get('season');

  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const season = seasonParam ? parseInt(seasonParam, 10) : undefined;

  try {
    // 1. 如果直接传入了 ikanbot 的 videoId
    if (id) {
      const result = await fetchIkanbotDetail(id);
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Ikanbot video detail not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: result });
    }

    // 2. 如果传入了片名
    if (title) {
      const result = await getIkanbotVideo(title, { year, season });
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'No matching video found in ikanbot' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: 'Missing title or id parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in /api/ikanbot:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
