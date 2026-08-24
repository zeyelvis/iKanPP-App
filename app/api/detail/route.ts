/**
 * Detail API Route
 * Fetches video details including episodes and M3U8 URLs with automatic source validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVideoDetail } from '@/lib/api/client';
import { getSourceById } from '@/lib/api/video-sources';
import { isSafeExternalUrl } from '@/lib/utils/security';

export const runtime = 'edge';

/**
 * Shared handler for fetching video details
 */
async function handleDetailRequest(id: string | null, source: string | null, method: string) {
  // Validate input
  if (!id) {
    return NextResponse.json(
      { error: 'Missing video ID parameter' },
      { status: 400 }
    );
  }

  // Validate source
  if (!source) {
    return NextResponse.json(
      { error: 'Missing source parameter' },
      { status: 400 }
    );
  }

  // 专属支持 Jable 原生视频流解析与双轨备用源容灾
  if (source === 'jable') {
    try {
      const detailRes = await fetch(`${new URL(id, 'http://localhost:3000').origin}/api/premium/stream?id=${encodeURIComponent(id)}`);
      if (detailRes.ok) {
        const streamData = await detailRes.json();
        if (streamData.stream_url) {
          return NextResponse.json({
            success: true,
            data: {
              vod_id: id,
              vod_name: streamData.title || id,
              vod_pic: streamData.cover,
              vod_actor: streamData.actors?.join(', ') || '',
              type_name: streamData.tags?.join(', ') || '午夜大片',
              episodes: [
                {
                  name: '4K 原画',
                  url: streamData.stream_url,
                }
              ]
            }
          });
        }
      }
    } catch (e) {
      console.error('[DetailAPI] Jable stream resolve error:', e);
    }
  }

  let sourceConfig;

  // If source is an object (from POST), use it
  if (typeof source === 'object') {
    sourceConfig = source;
  } else {
    // If source is a string ID (from GET), try to look it up
    sourceConfig = getSourceById(source);
  }

  // MED-1 修复：校验 sourceConfig 是否合法且非内网目标
  if (!sourceConfig || !isSafeExternalUrl(sourceConfig.baseUrl)) {
    return NextResponse.json(
      { error: 'Invalid or forbidden source configuration' },
      { status: 400 }
    );
  }

  // Fetch video detail without validation (already validated during search)
  try {
    const videoDetail = await getVideoDetail(id, sourceConfig);

    // Skip validation - videos are already checked during search
    // Just return the episodes as-is


    return NextResponse.json({
      success: true,
      data: videoDetail,
    });
  } catch (error) {
    console.error('Detail API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch video detail',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const source = searchParams.get('source');

    return await handleDetailRequest(id, source, 'GET');
  } catch (error) {
    console.error('Detail API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Support POST method for complex requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, source } = body;

    return await handleDetailRequest(id, source, 'POST');
  } catch (error) {
    console.error('Detail API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
