import { NextRequest, NextResponse } from 'next/server';
import { createBatchVipCards } from '@/lib/supabase/cards';
import { VipCardType } from '@/lib/vip/cards';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { cardType, count, batchName } = body;

        if (!cardType || !count) {
            return NextResponse.json(
                { success: false, message: '请指定卡密类型与生成数量' },
                { status: 400 }
            );
        }

        const result = await createBatchVipCards(cardType as VipCardType, Number(count), batchName);
        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (err: any) {
        console.error('[API] /api/vip/generate error:', err);
        return NextResponse.json(
            { success: false, message: err.message || '内部服务器错误' },
            { status: 500 }
        );
    }
}
