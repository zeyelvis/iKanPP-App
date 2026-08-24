'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Crown,
    Sparkles,
    CheckCircle2,
    X,
    Key,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Zap,
    ShieldCheck,
    Gift,
    Copy,
    Check,
    Film,
    Play,
    Flame
} from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { sanitizeCardCode } from '@/lib/vip/cards';

interface VipPromptProps {
    /** 弹窗模式：显示右上角关闭按钮 */
    asModal?: boolean;
    /** 关闭回调 */
    onClose?: () => void;
    /** 打开登录弹窗 */
    onOpenLogin?: () => void;
}

// 4 大核心金标权益
const VIP_KEY_BENEFITS = [
    {
        title: '原生 4K (2160P) 极清',
        desc: '专属超高码率原画专线，毛孔级超清视听',
        badge: '2160P UHD',
    },
    {
        title: '36 大午夜专线无限制',
        desc: '探探、色界、老司机4K、91制片厂全解锁',
        badge: '36 条专线',
    },
    {
        title: 'S1 / MOODYZ 厂牌直达',
        desc: '顶级番号智能解析，原盘海报封面一键直达',
        badge: '原盘番号库',
    },
    {
        title: '极速秒播 · 纯净零广告',
        desc: '纯净海外 CDN 加速流，告别所有弹窗干扰',
        badge: '极速秒播',
    },
];

export function VipPrompt({ asModal = false, onClose, onOpenLogin }: VipPromptProps) {
    const { user, refreshProfile } = useUserStore();
    const [viewMode, setViewMode] = useState<'plans' | 'redeem'>('plans');
    const [copied, setCopied] = useState(false);
    const [cardCode, setCardCode] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [redeemStatus, setRedeemStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isLoggedIn = !!user;
    const isVip = user?.isVip ?? false;
    const inviteCode = user?.inviteCode;

    // 复制邀请链接
    const handleCopyInvite = async () => {
        if (!inviteCode) return;
        const link = `${window.location.origin}?ref=${inviteCode}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = link;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // 快速卡密兑换
    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = sanitizeCardCode(cardCode);
        if (!code) {
            setRedeemStatus({ type: 'error', text: '请输入卡密激活码' });
            return;
        }
        if (!user) {
            setRedeemStatus({ type: 'error', text: '请先登录账号' });
            onOpenLogin?.();
            return;
        }

        setRedeemLoading(true);
        setRedeemStatus(null);
        try {
            const res = await fetch('/api/vip/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, userId: user.id }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRedeemStatus({ type: 'success', text: data.message || '🎉 激活成功！已解锁尊荣 VIP 特权' });
                setCardCode('');
                await refreshProfile();
                setTimeout(() => {
                    onClose?.();
                }, 1500);
            } else {
                setRedeemStatus({ type: 'error', text: data.message || '卡密无效或已被使用' });
            }
        } catch {
            setRedeemStatus({ type: 'error', text: '网络请求失败，请稍后重试' });
        } finally {
            setRedeemLoading(false);
        }
    };

    const vipExpiry = user?.vipUntil
        ? new Date(user.vipUntil).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <div className={`relative ${asModal ? 'py-2' : 'min-h-[85vh] py-8 sm:py-12'} flex items-center justify-center px-4`}>
            
            {/* 顶奢极光黑金玻璃态容器 */}
            <div className="relative z-10 w-full max-w-3xl mx-auto rounded-3xl bg-gradient-to-b from-[#161320]/98 via-[#0F0D16]/98 to-[#09080E]/98 backdrop-blur-3xl border border-amber-500/25 shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(245,158,11,0.12)] p-6 sm:p-9 overflow-hidden">
                
                {/* 顶部环境流光光晕 */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />

                {/* 弹窗关闭按钮 */}
                {asModal && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer z-30"
                        aria-label="关闭"
                    >
                        <X size={18} />
                    </button>
                )}

                {/* 1. 顶部 Hero 视觉中心：鎏金皇冠 + 尊贵标题 */}
                <div className="text-center relative z-10 space-y-3 pt-2 sm:pt-4">
                    {/* 3D 鎏金皇冠徽章 */}
                    <div className="inline-flex relative mb-1">
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-500/40 rounded-full blur-lg animate-pulse" />
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-[1.5px] shadow-2xl shadow-amber-500/30">
                            <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#1C182B] to-[#0A0910] flex items-center justify-center border border-amber-300/30">
                                <Crown size={32} className="text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 fill-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
                            </div>
                        </div>
                    </div>

                    {/* 页面主标题 */}
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider mb-2 shadow-sm">
                            <Sparkles size={13} className="text-amber-300 fill-amber-300" />
                            <span>午夜 18+ 尊荣特权专区</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                            开启午夜 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">4K 极清尊享体验</span>
                        </h2>
                        <p className="text-white/60 text-xs sm:text-sm max-w-lg mx-auto mt-1.5 leading-relaxed">
                            解锁全站 36 大午夜专线 · 原生 2160P 蓝光原画 · S1/MOODYZ 原盘番号
                        </p>
                    </div>
                </div>

                {/* 2. 模式切换 Tabs（尊享开通 vs 卡密兑换） */}
                <div className="flex items-center justify-center gap-2 mt-6 mb-7 relative z-10">
                    <div className="p-1 rounded-2xl bg-[#09080F] border border-white/10 flex items-center gap-1 shadow-inner">
                        <button
                            onClick={() => setViewMode('plans')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                                viewMode === 'plans'
                                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/25 scale-[1.02]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Crown size={15} className={viewMode === 'plans' ? 'text-black' : 'text-amber-400'} />
                            <span>开通与体验方案</span>
                        </button>

                        <button
                            onClick={() => setViewMode('redeem')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                                viewMode === 'redeem'
                                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/25 scale-[1.02]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Key size={15} className={viewMode === 'redeem' ? 'text-black' : 'text-amber-400'} />
                            <span>卡密激活 / 兑换码</span>
                        </button>
                    </div>
                </div>

                {/* 3. 视图 A：开通方案与核心权益展示 */}
                {viewMode === 'plans' && (
                    <div className="space-y-6 relative z-10 animate-fade-in">
                        
                        {/* 方案卡片推荐（高光免单方案 + 邀请裂变） */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            
                            {/* 方案 1：新用户 30 天免费体验（主推） */}
                            <div className="relative rounded-2xl bg-gradient-to-b from-amber-500/15 via-yellow-500/5 to-transparent border-2 border-amber-400/60 p-5 shadow-lg shadow-amber-500/10 flex flex-col justify-between group hover:border-amber-400 transition-all">
                                {/* 顶部角标 */}
                                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-black tracking-wider shadow-md">
                                    🔥 热门首选 · 免费赠送
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                                            <Gift size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-white">新用户 30 天 VIP 体验</h3>
                                            <p className="text-[11px] text-amber-300/80">注册账号即刻全功能激活</p>
                                        </div>
                                    </div>

                                    <div className="my-3 flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-amber-300">¥ 0</span>
                                        <span className="text-xs text-white/40 line-through">¥ 38/月</span>
                                        <span className="text-[11px] text-emerald-400 font-bold ml-2">免单赠送 30 天</span>
                                    </div>

                                    <p className="text-xs text-white/60 leading-relaxed">
                                        畅享 36 大午夜专线、2160P 极清超高码率、零广告秒播与私密跨端记录。
                                    </p>
                                </div>

                                <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                                    <span>状态：{isVip ? <strong className="text-emerald-400">已激活</strong> : <strong className="text-amber-300">待领取</strong>}</span>
                                    <span>{isVip && vipExpiry ? `有效期至 ${vipExpiry}` : '无需绑卡 · 立即生效'}</span>
                                </div>
                            </div>

                            {/* 方案 2：邀请裂变免费续期 15 天 */}
                            <div className="relative rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-5 flex flex-col justify-between transition-all">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-white">好友邀请无限送 VIP</h3>
                                            <p className="text-[11px] text-purple-300/80">每成功邀请 1 人双方各得 15 天</p>
                                        </div>
                                    </div>

                                    <div className="my-3 flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-purple-300">+15</span>
                                        <span className="text-xs text-purple-300/80 font-bold">天 VIP / 人</span>
                                        <span className="text-[11px] text-purple-400 font-bold ml-2">上不封顶</span>
                                    </div>

                                    <p className="text-xs text-white/60 leading-relaxed">
                                        分享您的专属链接，好友注册即可自动到账 15 天全功能 VIP 时长。
                                    </p>
                                </div>

                                <div className="pt-4 mt-2 border-t border-white/10">
                                    {isLoggedIn && inviteCode ? (
                                        <button
                                            onClick={handleCopyInvite}
                                            className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                        >
                                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                            <span>{copied ? '已复制专属邀请链接' : `复制邀请码: ${inviteCode}`}</span>
                                        </button>
                                    ) : (
                                        <div className="text-[11px] text-white/40 text-center">
                                            登录后即可获取专属邀请链接
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 4 大核心金标权益横向展示栏 */}
                        <div className="rounded-2xl bg-black/40 border border-white/5 p-4 sm:p-5">
                            <div className="text-xs font-black text-amber-300/90 mb-3.5 flex items-center gap-1.5 uppercase tracking-wider">
                                <ShieldCheck size={14} className="text-amber-400" />
                                <span>尊享核心权益矩阵</span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {VIP_KEY_BENEFITS.map((item, idx) => (
                                    <div key={idx} className="flex flex-col space-y-1 p-2 rounded-xl bg-white/[0.02]">
                                        <div className="flex items-center gap-1.5 text-xs font-black text-white">
                                            <CheckCircle2 size={14} className="text-amber-400 shrink-0 fill-amber-400/20" />
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                        <p className="text-[11px] text-white/50 leading-tight">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 底部超级行动大按钮（极具视觉张力的高亮流光黄金按钮） */}
                        <div className="pt-2">
                            {isVip ? (
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-black font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                                >
                                    <Play size={18} className="fill-black" />
                                    <span>您已拥有 VIP 尊荣权限 · 立即畅快开播</span>
                                </button>
                            ) : isLoggedIn ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setViewMode('redeem')}
                                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                                    >
                                        <Key size={18} />
                                        <span>输入卡密 / 兑换码立即激活</span>
                                    </button>
                                    <p className="text-center text-xs text-white/40">
                                        已登录当前账号：<span className="text-amber-300 font-bold">{user?.email}</span>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={onOpenLogin}
                                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-[0_10px_35px_rgba(245,158,11,0.4)] hover:shadow-[0_15px_45px_rgba(245,158,11,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                                    >
                                        <Zap size={20} className="fill-black" />
                                        <span>⚡ 免费注册 / 登录即领 30 天 VIP 体验</span>
                                    </button>
                                    <div className="flex items-center justify-center gap-4 text-xs text-white/50">
                                        <span>已有卡密兑换码？</span>
                                        <button
                                            onClick={() => setViewMode('redeem')}
                                            className="text-amber-300 font-bold hover:underline cursor-pointer"
                                        >
                                            点击快速激活 ➔
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. 视图 B：卡密兑换表单模式 */}
                {viewMode === 'redeem' && (
                    <div className="space-y-6 relative z-10 animate-fade-in max-w-lg mx-auto py-2">
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-black text-white">输入 VIP 卡密兑换码</h3>
                            <p className="text-xs text-white/50">激活后立即可解锁全站 36 大午夜专线与 4K 原画流</p>
                        </div>

                        <form onSubmit={handleRedeem} className="space-y-4">
                            <div className="relative">
                                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                                <input
                                    type="text"
                                    value={cardCode}
                                    onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                                    placeholder="请输入 16 位卡密 (如: VIP-ABCD-1234)"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/60 border border-amber-400/40 text-amber-100 placeholder-white/25 text-sm sm:text-base font-mono tracking-widest focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all shadow-inner"
                                    disabled={redeemLoading}
                                    autoFocus
                                />
                            </div>

                            {/* 状态消息 */}
                            {redeemStatus && (
                                <div
                                    className={`flex items-center gap-2 p-3.5 rounded-xl text-xs sm:text-sm font-medium ${
                                        redeemStatus.type === 'success'
                                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                                            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                                    }`}
                                >
                                    {redeemStatus.type === 'success' ? (
                                        <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                                    ) : (
                                        <AlertCircle size={16} className="shrink-0 text-rose-400" />
                                    )}
                                    <span>{redeemStatus.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={redeemLoading}
                                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                            >
                                {redeemLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>正在核销卡密中...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        <span>立即核销并解锁 VIP</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center pt-2">
                            <button
                                onClick={() => setViewMode('plans')}
                                className="text-xs text-white/50 hover:text-amber-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                                <ArrowLeft size={13} />
                                <span>返回查看 VIP 开通方案</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 底部通用影视主站快速返回通道（非弹窗模式） */}
                {!asModal && (
                    <div className="text-center mt-8 pt-6 border-t border-white/10 relative z-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-amber-300 transition-colors group"
                        >
                            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span>返回通用影视主站首页</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
