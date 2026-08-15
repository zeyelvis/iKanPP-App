/**
 * Ping API Route - Measures latency to video sources
 * Returns response time for real-time latency display
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSafeExternalUrl } from '@/lib/utils/security';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        // HIGH-1 修复：SSRF 防护 — 严禁对内网/本地端口进行探测
        if (!isSafeExternalUrl(url)) {
            return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
        }

        const startTime = performance.now();

        try {
            // Use HEAD request for faster ping (less data transfer)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

            await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; PingService/1.0)',
                },
            });

            clearTimeout(timeoutId);

            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);

            return NextResponse.json({ latency, success: true });
        } catch {
            // If HEAD fails, try GET with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            try {
                await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; PingService/1.0)',
                    },
                });
                clearTimeout(timeoutId);

                const endTime = performance.now();
                const latency = Math.round(endTime - startTime);
                return NextResponse.json({ latency, success: true });
            } catch {
                clearTimeout(timeoutId);
                const endTime = performance.now();
                const latency = Math.round(endTime - startTime);
                return NextResponse.json({ latency, success: false, timeout: true });
            }
        }
    } catch (error) {
        console.error('Ping error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
