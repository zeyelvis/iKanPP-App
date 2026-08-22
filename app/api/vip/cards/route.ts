import { NextRequest, NextResponse } from 'next/server';
import { listVipCards, revokeVipCard } from '@/lib/supabase/cards';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') as any || 'all';
        const cardType = searchParams.get('cardType') || 'all';
        const limit = Number(searchParams.get('limit')) || 100;

        const cards = await listVipCards({ status, cardType, limit });
        return NextResponse.json({ success: true, cards });
    } catch (err: any) {
        console.error('[API] /api/vip/cards error:', err);
        return NextResponse.json(
            { success: false, message: err.message || '内部服务器错误' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { cardId } = body;

        if (!cardId) {
            return NextResponse.json({ success: false, message: '缺少 cardId 参数' }, { status: 400 });
        }

        const success = await revokeVipCard(cardId);
        return NextResponse.json({ success, message: success ? '卡密已成功作废' : '作废失败或卡密已使用' });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || '操作失败' }, { status: 500 });
    }
}
