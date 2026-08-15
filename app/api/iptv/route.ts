/**
 * IPTV Proxy API Route
 * Fetches M3U playlist files to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSafeExternalUrl } from '@/lib/utils/security';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // CRIT-2 修复：SSRF 防护 — 严禁访问内网 IP 与非法协议
    if (!isSafeExternalUrl(url)) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; KVideo/1.0)',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch: ${response.status}` },
                { status: response.status }
            );
        }

        const text = await response.text();

        return new NextResponse(text, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch M3U playlist' },
            { status: 500 }
        );
    }
}
