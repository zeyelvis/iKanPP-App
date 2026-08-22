import { NextRequest, NextResponse } from 'next/server';
import { redeemCard } from '@/lib/supabase/cards';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, userId } = body;

        if (!code || !userId) {
            return NextResponse.json(
                { success: false, message: '参数不完整：需要卡密和用户 ID' },
                { status: 400 }
            );
        }

        const result = await redeemCard(code, userId);
        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (err: any) {
        console.error('[API] /api/vip/redeem error:', err);
        return NextResponse.json(
            { success: false, message: err.message || '内部服务器错误' },
            { status: 500 }
        );
    }
}
