'use client';

/**
 * VipRedeemCard — 个人中心永久免费会员尊享卡片
 * 全站全面免费制度：所有特权默认 100% 永久免费激活
 */
import React from 'react';
import { Crown, Sparkles, Film, Zap, Cloud, Shield, Gift, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';

export function VipRedeemCard() {
    const { user } = useUserStore();

    const VIP_PERKS = [
        { icon: Film, title: '4K 超清原画', desc: '畅享院线顶级画质', color: 'text-amber-400' },
        { icon: Zap, title: '午夜专属专区', desc: '36 大顶流专线全免', color: 'text-rose-400' },
        { icon: Cloud, title: '多端云端漫游', desc: '收藏历史实时同步', color: 'text-blue-400' },
        { icon: Shield, title: '纯净零广告', desc: '全站零弹窗直达秒播', color: 'text-emerald-400' },
        { icon: Sparkles, title: '专线极速解析', desc: '毫秒级换源与秒播', color: 'text-purple-400' },
        { icon: Gift, title: '终身尊享特权', desc: '永久全站 100% 免费', color: 'text-yellow-400' },
    ];

    return (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-white/[0.04] to-white/[0.02] backdrop-blur-2xl p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
            {/* 装饰金光背景 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 顶部标题与终身徽章 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/30">
                        <Crown size={20} />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                            永久终身尊享会员
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 size={11} /> 永久全免已生效
                            </span>
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">全站所有资源与 4K 蓝光流 100% 永久免费开放，无需充值卡密</p>
                    </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold text-center sm:text-right">
                    🎉 终身免费 · 零付费门槛
                </div>
            </div>

            {/* 6 大尊享权益网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
                {VIP_PERKS.map((perk, idx) => {
                    const Icon = perk.icon;
                    return (
                        <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.06] transition-all flex items-start gap-3 group"
                        >
                            <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${perk.color} group-hover:scale-110 transition-transform shrink-0`}>
                                <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                    {perk.title}
                                </h4>
                                <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">
                                    {perk.desc}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
