import { NextRequest, NextResponse } from 'next/server';
import { fetchJableVideoDetail } from '@/lib/server/jable-scraper';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';

export const runtime = 'edge';

/**
 * Jable 原生无广告 M3U8 流直解与智能容灾端点
 * 
 * 参数：
 * - id: 视频 ID (如 jable 的 slug 或 视频 ID)
 * - code: 视频番号 (如 SSIS-123, FC2-PPV-123456)
 * - name: 视频名称 (用于备用源容灾检索)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const code = searchParams.get('code') || '';
    const name = searchParams.get('name') || '';

    if (!id && !code && !name) {
        return NextResponse.json({ error: 'Missing id, code or name parameter' }, { status: 400 });
    }

    try {
        let streamUrl: string | undefined;
        let videoTitle = name;
        let videoCode = code;
        let sourceUsed = 'jable';
        let cover: string | undefined;
        let actors: string[] = [];
        let tags: string[] = [];

        // 1. 优先尝试从 Jable 官方视频页直解原生 M3U8
        if (id && !id.match(/^\d+$/)) {
            const detail = await fetchJableVideoDetail(id);
            if (detail && detail.hlsUrl) {
                streamUrl = detail.hlsUrl;
                videoTitle = detail.title || videoTitle;
                videoCode = detail.videoCode || videoCode;
                cover = detail.cover;
                actors = detail.actors || [];
                tags = detail.tags || [];
                sourceUsed = 'jable';
            }
        }

        // 2. 若 Jable 直解未果或传入的是纯数字 ID/番号，启用双轨智能热备容灾
        if (!streamUrl) {
            const searchQuery = videoCode || id || name;
            console.log(`[StreamResolver] Fallback searching for query: ${searchQuery}`);

            // 智能检索现有备用专线
            const fallbackRes = await fetch(`${request.nextUrl.origin}/api/premium/category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sources: PREMIUM_SOURCES,
                    category: searchQuery,
                    page: '1',
                    limit: '5'
                })
            });

            if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                const matchedVideo = fallbackData.videos?.[0];

                if (matchedVideo && matchedVideo.vod_play_url) {
                    // 解析播放列表格式 (url#url 或 name$url)
                    const playList = matchedVideo.vod_play_url.split('#');
                    const firstEp = playList[0];
                    const rawUrl = firstEp.includes('$') ? firstEp.split('$')[1] : firstEp;

                    if (rawUrl && rawUrl.startsWith('http')) {
                        streamUrl = rawUrl;
                        sourceUsed = matchedVideo.source || 'backup_source';
                        videoTitle = matchedVideo.vod_name || videoTitle;
                        cover = matchedVideo.vod_pic || cover;
                    }
                }
            }
        }

        if (!streamUrl) {
            return NextResponse.json({
                error: 'Stream not found or currently unavailable',
                code: 404
            }, { status: 404 });
        }

        // 包装经过 Referer 伪装与去广告的代理 M3U8 地址
        const proxiedStreamUrl = streamUrl.includes('.m3u8')
            ? `/api/proxy?url=${encodeURIComponent(streamUrl)}&referer=${encodeURIComponent('https://jable.tv/')}`
            : streamUrl;

        return NextResponse.json({
            code: 200,
            title: videoTitle,
            video_code: videoCode,
            cover,
            actors,
            tags,
            stream_url: proxiedStreamUrl,
            raw_stream_url: streamUrl,
            source: sourceUsed,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });
    } catch (error: any) {
        console.error('[StreamResolver] Error resolving stream:', error);
        return NextResponse.json({
            error: 'Failed to resolve video stream',
            details: error.message
        }, { status: 500 });
    }
}
