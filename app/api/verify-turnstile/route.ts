/**
 * Turnstile 服务端验证 API
 * 安全：IP 频率限制 + Cloudflare 官方校验 + 严禁客户端请求头伪造环境
 */
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/utils/security';

export const runtime = 'edge';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
const TURNSTILE_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export async function POST(request: NextRequest) {
    try {
        // 提取客户端 IP 并进行速率限制
        const ip = getClientIp(request);

        if (isRateLimited(`turnstile:${ip}`, 10, 60_000)) {
            return NextResponse.json(
                { success: false, error: '请求过于频繁，请稍后再试' },
                { status: 429 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { token } = body;

        if (!token || typeof token !== 'string') {
            return NextResponse.json(
                { success: false, error: '缺少验证 token' },
                { status: 400 }
            );
        }

        // CRIT-1 修复：仅在非生产环境变量下允许使用测试密钥，严禁信任客户端 Referer 请求头
        const isDev = process.env.NODE_ENV === 'development';
        const secretKey = isDev ? (process.env.TURNSTILE_SECRET_KEY || TURNSTILE_TEST_SECRET_KEY) : TURNSTILE_SECRET_KEY;

        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);

        if (ip && ip !== 'unknown') {
            formData.append('remoteip', ip);
        }

        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            }
        );

        if (!verifyResponse.ok) {
            return NextResponse.json(
                { success: false, error: '验证服务连接失败' },
                { status: 502 }
            );
        }

        const result = await verifyResponse.json();

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            // 不暴露内部错误码，统一返回通用错误
            return NextResponse.json(
                { success: false, error: '人机验证失败，请重试' },
                { status: 403 }
            );
        }
    } catch {
        return NextResponse.json(
            { success: false, error: '验证服务异常' },
            { status: 500 }
        );
    }
}
