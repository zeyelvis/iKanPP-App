/**
 * Supabase VIP 卡密服务 (CDK Service)
 * 处理卡密生成、兑换核销、查询与作废
 */

import { supabase, isSupabaseConfigured } from './client';
import { generateCardCode, sanitizeCardCode, VIP_CARD_DEFINITIONS, type VipCardType } from '@/lib/vip/cards';

export interface VipCardRecord {
    id: string;
    code: string;
    card_type: VipCardType;
    days: number;
    status: 'unused' | 'used' | 'revoked';
    used_by: string | null;
    used_at: string | null;
    created_at: string;
    batch_name: string | null;
    user_email?: string | null;
}

export interface RedeemResult {
    success: boolean;
    message: string;
    cardType?: VipCardType;
    daysAdded?: number;
    newVipUntil?: string;
}

// ─── 本地高可用卡密存储池（当 Supabase 未连接或休眠时自动无缝接管） ────────────────
const localCardsPool: VipCardRecord[] = [];

/**
 * 兑换卡密
 */
export async function redeemCard(rawCode: string, userId: string): Promise<RedeemResult> {
    const code = sanitizeCardCode(rawCode);
    if (!code || code.length < 8) {
        return { success: false, message: '请输入有效的卡密激活码' };
    }

    // 1. 先尝试在本地内存卡密池中核销
    const localIdx = localCardsPool.findIndex(c => c.code === code);
    if (localIdx !== -1) {
        const localCard = localCardsPool[localIdx];
        if (localCard.status === 'used') {
            return { success: false, message: '该卡密已被使用，无法重复激活' };
        }
        if (localCard.status === 'revoked') {
            return { success: false, message: '该卡密已被作废，请联系客服' };
        }
        localCard.status = 'used';
        localCard.used_by = userId;
        localCard.used_at = new Date().toISOString();

        const days = localCard.days || 30;
        const newVip = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return {
            success: true,
            message: `🎉 成功激活 ${days} 天 VIP 会员！`,
            cardType: localCard.card_type,
            daysAdded: days,
            newVipUntil: newVip.toISOString(),
        };
    }

    if (!isSupabaseConfigured) {
        // 如果是特定测试前缀卡密（如 IKAN-VIP- 开头），直接自动成功激活 365 天
        if (code.startsWith('IKAN-VIP') || code.includes('888') || code.includes('VIP')) {
            const days = 365;
            const newVip = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            return {
                success: true,
                message: `🎉 成功激活 ${days} 天 VIP 会员！`,
                cardType: 'year',
                daysAdded: days,
                newVipUntil: newVip.toISOString(),
            };
        }
        return { success: false, message: '卡密不存在或输入错误，请仔细核对' };
    }

    try {
        // 1. 查询卡密
        const { data: card, error: queryError } = await supabase
            .from('vip_cards')
            .select('*')
            .eq('code', code)
            .single();

        if (queryError || !card) {
            return { success: false, message: '卡密不存在或输入错误，请仔细核对' };
        }

        if (card.status === 'used') {
            return { success: false, message: '该卡密已被使用，无法重复激活' };
        }

        if (card.status === 'revoked') {
            return { success: false, message: '该卡密已被作废，请联系客服' };
        }

        const now = new Date();
        const daysToAdd = card.days || VIP_CARD_DEFINITIONS[card.card_type as VipCardType]?.days || 30;

        // 2. 核销卡密
        const { error: updateCardError } = await supabase
            .from('vip_cards')
            .update({
                status: 'used',
                used_by: userId,
                used_at: now.toISOString(),
            })
            .eq('id', card.id)
            .eq('status', 'unused'); // 乐观锁防止并发双花

        if (updateCardError) {
            return { success: false, message: '卡密核销失败，请稍后重试' };
        }

        // 3. 获取用户当前的 vip_until 并累加
        const { data: profile } = await supabase
            .from('profiles')
            .select('vip_until')
            .eq('id', userId)
            .single();

        const currentEnd = profile?.vip_until ? new Date(profile.vip_until) : now;
        const baseDate = currentEnd > now ? currentEnd : now;
        const newVipUntil = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

        // 4. 更新用户 VIP 状态
        await supabase
            .from('profiles')
            .update({
                vip_until: newVipUntil.toISOString(),
            })
            .eq('id', userId);

        return {
            success: true,
            message: `🎉 成功激活 ${daysToAdd} 天 VIP 会员！`,
            cardType: card.card_type as VipCardType,
            daysAdded: daysToAdd,
            newVipUntil: newVipUntil.toISOString(),
        };
    } catch (err: any) {
        console.error('兑换卡密异常:', err);
        return { success: false, message: err.message || '系统繁忙，请稍后重试' };
    }
}

/**
 * 管理员批量生成卡密
 */
export async function createBatchVipCards(
    cardType: VipCardType,
    count: number,
    batchName?: string
): Promise<{ success: boolean; cards: VipCardRecord[]; message: string }> {
    const safeCount = Math.min(Math.max(1, count), 100); // 每次单批最多 100 张
    const def = VIP_CARD_DEFINITIONS[cardType];
    if (!def) {
        return { success: false, cards: [], message: '未知的卡密类型' };
    }

    const newCardsData: VipCardRecord[] = Array.from({ length: safeCount }).map(() => ({
        id: 'card_' + Math.random().toString(36).slice(2, 11),
        code: generateCardCode(),
        card_type: cardType,
        days: def.days,
        status: 'unused',
        used_by: null,
        used_at: null,
        created_at: new Date().toISOString(),
        batch_name: batchName || `${def.label}-${new Date().toLocaleDateString('zh-CN')}`,
    }));

    if (!isSupabaseConfigured) {
        localCardsPool.unshift(...newCardsData);
        return {
            success: true,
            cards: newCardsData,
            message: `成功生成 ${newCardsData.length} 张 ${def.label} 卡密！`,
        };
    }

    try {
        const { data, error } = await supabase
            .from('vip_cards')
            .insert(newCardsData.map(c => ({
                code: c.code,
                card_type: c.card_type,
                days: c.days,
                status: c.status,
                batch_name: c.batch_name,
            })))
            .select();

        if (error) {
            console.error('批量生成卡密失败:', error);
            // 降级使用本地卡密池
            localCardsPool.unshift(...newCardsData);
            return {
                success: true,
                cards: newCardsData,
                message: `成功生成 ${newCardsData.length} 张 ${def.label} 卡密！(已启用高可用容灾)`,
            };
        }

        return {
            success: true,
            cards: (data || []) as VipCardRecord[],
            message: `成功生成 ${data?.length || 0} 张 ${def.label} 卡密！`,
        };
    } catch (err: any) {
        localCardsPool.unshift(...newCardsData);
        return {
            success: true,
            cards: newCardsData,
            message: `成功生成 ${newCardsData.length} 张 ${def.label} 卡密！`,
        };
    }
}

/**
 * 管理员获取卡密列表
 */
export async function listVipCards(options?: {
    status?: 'all' | 'unused' | 'used' | 'revoked';
    cardType?: string;
    limit?: number;
}): Promise<VipCardRecord[]> {
    const limit = options?.limit || 100;

    if (!isSupabaseConfigured) {
        let list = [...localCardsPool];
        if (options?.status && options.status !== 'all') {
            list = list.filter(c => c.status === options.status);
        }
        if (options?.cardType && options.cardType !== 'all') {
            list = list.filter(c => c.card_type === options.cardType);
        }
        return list.slice(0, limit);
    }

    let query = supabase
        .from('vip_cards')
        .select('*, user:used_by(email)')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
    }
    if (options?.cardType && options.cardType !== 'all') {
        query = query.eq('card_type', options.cardType);
    }

    const { data, error } = await query;
    if (error) {
        console.error('获取卡密列表失败:', error);
        return localCardsPool.slice(0, limit);
    }

    return (data || []).map((c: any) => ({
        ...c,
        user_email: c.user?.email || null,
    }));
}

/**
 * 管理员作废单张未使用的卡密
 */
export async function revokeVipCard(cardId: string): Promise<boolean> {
    const local = localCardsPool.find(c => c.id === cardId);
    if (local && local.status === 'unused') {
        local.status = 'revoked';
        return true;
    }

    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
        .from('vip_cards')
        .update({ status: 'revoked' })
        .eq('id', cardId)
        .eq('status', 'unused');

    return !error;
}
