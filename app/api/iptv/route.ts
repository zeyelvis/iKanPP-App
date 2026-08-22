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

    // 构建候选拉取地址列表（针对 GitHub Raw 自动加入 CDN 镜像容灾）
    const candidates = [url];
    if (url.includes('raw.githubusercontent.com/')) {
        // e.g. https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u
        // -> https://cdn.jsdelivr.net/gh/Guovin/iptv-api@gd/output/result.m3u
        const parts = url.replace('https://raw.githubusercontent.com/', '').split('/');
        if (parts.length >= 3) {
            const user = parts[0];
            const repo = parts[1];
            const branch = parts[2];
            const rest = parts.slice(3).join('/');
            candidates.push(`https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${rest}`);
            candidates.push(`https://fastly.jsdelivr.net/gh/${user}/${repo}@${branch}/${rest}`);
        }
    }

    let lastError = 'Failed to fetch M3U playlist';
    let lastStatus = 500;

    for (const targetUrl of candidates) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                },
                signal: controller.signal,
            });

            clearTimeout(timer);

            if (!response.ok) {
                lastStatus = response.status;
                continue;
            }

            const text = await response.text();
            if (!text || text.trim().length === 0) continue;

            return new NextResponse(text, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=600, s-maxage=600', // 10 分钟缓存
                },
            });
        } catch (e: any) {
            lastError = e?.message || 'Failed to fetch M3U playlist';
        }
    }

    return NextResponse.json(
        { error: lastError },
        { status: lastStatus }
    );
}
