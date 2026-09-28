import { NextRequest, NextResponse } from 'next/server';
import { listVipCards, revokeVipCard, createBatchVipCards, redeemCard } from '@/lib/supabase/cards';
import { VipCardType } from '@/lib/vip/cards';

export const runtime = 'edge';

/**
 * VIP 卡密管理与兑换中枢 API (合并路由，消除多 Edge Function 运行时包膨胀)
 * 路由支持：
 * - GET    /api/vip/cards     -> 获取卡密列表
 * - DELETE /api/vip/cards     -> 作废卡密
 * - POST   /api/vip/generate  -> 批量生成卡密
 * - POST   /api/vip/redeem    -> 兑换卡密
 */

interface RouteContext {
  params: Promise<{ slug?: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const action = (slug?.[0] || '').toLowerCase();

  if (action === 'cards') {
    try {
      const { searchParams } = new URL(req.url);
      const status = (searchParams.get('status') as any) || 'all';
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

  return NextResponse.json({ success: false, message: '未找到对应操作' }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const action = (slug?.[0] || '').toLowerCase();

  // 1. 批量生成卡密
  if (action === 'generate') {
    try {
      const body = await req.json().catch(() => ({}));
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

  // 2. 兑换卡密
  if (action === 'redeem') {
    try {
      const body = await req.json().catch(() => ({}));
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

  return NextResponse.json({ success: false, message: '未找到对应操作' }, { status: 404 });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const action = (slug?.[0] || '').toLowerCase();

  if (action === 'cards') {
    try {
      const body = await req.json().catch(() => ({}));
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

  return NextResponse.json({ success: false, message: '未找到对应操作' }, { status: 404 });
}
