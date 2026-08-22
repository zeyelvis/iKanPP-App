'use client';

/**
 * VipRedeemCard — 个人中心 VIP 卡密兑换与权益展示组件
 * 支持一键兑换 CDK、输入格式化、即时生效与权益网格展示
 */
import React, { useState } from 'react';
import { Crown, Sparkles, Key, CheckCircle2, AlertCircle, Loader2, Film, Zap, Cloud, Shield, Gift, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { sanitizeCardCode, VIP_CARD_DEFINITIONS } from '@/lib/vip/cards';

export function VipRedeemCard() {
    const { user, refreshProfile } = useUserStore();
    const [cardCode, setCardCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = sanitizeCardCode(cardCode);
        if (!code) {
            setStatusMsg({ type: 'error', text: '请输入卡密激活码' });
            return;
        }
        if (!user) {
            setStatusMsg({ type: 'error', text: '请先登录账户后再激活卡密' });
            return;
        }

        setLoading(true);
        setStatusMsg(null);

        try {
            const res = await fetch('/api/vip/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, userId: user.id }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setStatusMsg({ type: 'success', text: data.message || '🎉 激活成功！' });
                setCardCode('');
                // 刷新用户个人资料和 VIP 状态
                await refreshProfile();
            } else {
                setStatusMsg({ type: 'error', text: data.message || '激活失败，请核对卡密' });
            }
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: '网络请求失败，请稍后重试' });
        } finally {
            setLoading(false);
        }
    };

    const VIP_PERKS = [
        { icon: Film, title: '4K超清原画', desc: '畅享院线顶级画质', color: 'text-amber-400' },
        { icon: Zap, title: '午夜专属专区', desc: '解锁午夜版精选内容', color: 'text-rose-400' },
        { icon: Cloud, title: '多端云同步', desc: '收藏历史实时漫游', color: 'text-blue-400' },
        { icon: Shield, title: '纯净免广告', desc: '全站零弹窗直达播放', color: 'text-emerald-400' },
        { icon: Sparkles, title: '专线极速解析', desc: '毫秒级换源与秒播', color: 'text-purple-400' },
        { icon: Gift, title: '尊贵身份标识', desc: '专属金色光环与勋章', color: 'text-yellow-400' },
    ];

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl p-5 sm:p-6 space-y-6 shadow-2xl">
            {/* 标题 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                        <Key size={18} />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                            卡密激活兑换
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                CDK REDEEM
                            </span>
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">输入您的专属兑换码，秒级延长 VIP 有效期</p>
                    </div>
                </div>
            </div>

            {/* 兑换表单 */}
            <form onSubmit={handleRedeem} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={cardCode}
                            onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                            placeholder="例如：IKAN-8M9K-2P7X-QR5T"
                            disabled={loading}
                            className="w-full h-11 px-4 pl-10 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all uppercase"
                        />
                        <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !cardCode.trim()}
                        className="h-11 px-6 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>激活中...</span>
                            </>
                        ) : (
                            <>
                                <Crown size={16} />
                                <span>立即激活</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 提示信息 */}
                {statusMsg && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
                        statusMsg.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                        {statusMsg.type === 'success' ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
                        <span>{statusMsg.text}</span>
                    </div>
                )}
            </form>

            {/* VIP 核心权益网格 */}
            <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white/60 tracking-wider">VIP 尊享 6 大核心特权</span>
                    <span className="text-[10px] text-amber-400/80 font-medium">全平台多端通用</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {VIP_PERKS.map((perk) => {
                        const Icon = perk.icon;
                        return (
                            <div
                                key={perk.title}
                                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Icon size={16} className={perk.color} />
                                    <span className="text-xs font-bold text-white/90">{perk.title}</span>
                                </div>
                                <p className="text-[10px] text-white/40">{perk.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
