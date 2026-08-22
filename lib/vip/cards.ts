/**
 * VIP 卡密规格与工具函数
 */

export type VipCardType = 'trial' | 'month' | 'quarter' | 'year' | 'lifetime';

export interface VipCardDefinition {
    type: VipCardType;
    label: string;
    days: number;
    description: string;
    badgeColor: string;
    recommended?: boolean;
}

export const VIP_CARD_DEFINITIONS: Record<VipCardType, VipCardDefinition> = {
    trial: {
        type: 'trial',
        label: '7天体验卡',
        days: 7,
        description: '新手畅享 · 试用全站特权',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    month: {
        type: 'month',
        label: '月度 VIP',
        days: 30,
        description: '30 天全功能畅享',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    quarter: {
        type: 'quarter',
        label: '季度 VIP',
        days: 90,
        description: '90 天畅看 · 性价比之选',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    year: {
        type: 'year',
        label: '年度 VIP',
        days: 365,
        description: '365 天无忧观影 · 超值优选',
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        recommended: true,
    },
    lifetime: {
        type: 'lifetime',
        label: '终身尊享 VIP',
        days: 36500, // 100 年
        description: '永久特权 · 终身免流免广',
        badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
};

/**
 * 生成单张格式化卡密字符串
 * 格式: IKAN-XXXX-XXXX-XXXX
 */
export function generateCardCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const segment = (len: number) => {
        let res = '';
        for (let i = 0; i < len; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
    };
    return `IKAN-${segment(4)}-${segment(4)}-${segment(4)}`;
}

/**
 * 格式化卡密输入（自动转大写、去空格）
 */
export function sanitizeCardCode(raw: string): string {
    return raw.trim().toUpperCase().replace(/\s+/g, '');
}
