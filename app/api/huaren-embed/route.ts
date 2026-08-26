import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 代理目标站官方播放器内核，剥离 X-Frame-Options 阻止嵌套策略
 * GET /api/huaren-embed?episode=194546-1-1
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const episode = searchParams.get('episode') || '194546-1-1';

    try {
        const targetUrl = `https://huaren.live/Player/ec?episode=${encodeURIComponent(episode)}`;
        const resp = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Referer': `https://huaren.live/vodplay/${episode}.html`,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });

        if (!resp.ok) {
            return new NextResponse(`<div style="color:white;background:#111;padding:20px;text-align:center;font-family:sans-serif;">加载官方播放器失败 (HTTP ${resp.status})</div>`, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        }

        let html = await resp.text();

        // 1. 注入 base 标签使相对路径脚本和样式能正确加载到 huaren.live 官方资源
        html = html.replace('<head>', '<head><base href="https://huaren.live/"><meta name="referrer" content="no-referrer">');

        // 2. 构造干净的响应头，彻底剥离 X-Frame-Options 和 Content-Security-Policy 限制
        const headers = new Headers();
        headers.set('Content-Type', 'text/html; charset=utf-8');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.delete('x-frame-options');
        headers.delete('content-security-policy');

        return new NextResponse(html, {
            status: 200,
            headers,
        });
    } catch (e: any) {
        return new NextResponse(`<div style="color:white;background:#111;padding:20px;text-align:center;font-family:sans-serif;">播放器加载异常: ${e?.message || '未知错误'}</div>`, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    }
}
