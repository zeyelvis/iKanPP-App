import { NextResponse } from 'next/server';
import { isAllowedDoubanImageUrl } from '@/lib/utils/security';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }

    // SSRF 防护：仅允许合法图片域名
    if (!isAllowedDoubanImageUrl(imageUrl)) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    // 🌟 统一并轨：301 永久重定向到现代化 /api/img-proxy 管线（享有 R2 持久化镜像与智能降维）
    return NextResponse.redirect(new URL(`/api/img-proxy?url=${encodeURIComponent(imageUrl)}`, request.url), 301);
}
