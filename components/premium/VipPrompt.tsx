import { useState } from 'react';
import Link from 'next/link';
import { Crown, Sparkles, Film, Search, Cloud, Gift, Copy, Check, LogIn, X, Key, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Zap, ShieldCheck, Flame, Tv } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { sanitizeCardCode } from '@/lib/vip/cards';

interface VipPromptProps {
    /** 弹窗模式：显示关闭按钮 */
    asModal?: boolean;
    /** 关闭回调 */
    onClose?: () => void;
    /** 打开登录弹窗 */
    onOpenLogin?: () => void;
}

// 6 大核心特权矩阵
const VIP_BENEFITS_GRID = [
    {
        icon: Zap,
        title: '原生 4K (2160P) 极清',
        desc: '专属超高码率原画专线，毛孔级视听震撼',
        color: 'text-amber-400',
        badge: '超高清',
        badgeBg: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    },
    {
        icon: Flame,
        title: '36 大午夜专线无限制',
        desc: '探探、色界、老司机4K、91制片厂全解锁',
        color: 'text-rose-400',
        badge: '全解锁',
        badgeBg: 'bg-rose-400/10 text-rose-300 border-rose-400/30',
    },
    {
        icon: Film,
        title: 'S1 / MOODYZ 厂牌直达',
        desc: '顶级番号智能解析，原盘封面海报一键查',
        color: 'text-purple-400',
        badge: '专业库',
        badgeBg: 'bg-purple-400/10 text-purple-300 border-purple-400/30',
    },
    {
        icon: Sparkles,
        title: '专线极速秒播零广告',
        desc: '纯净海外 CDN 加速流，彻底告别弹窗',
        color: 'text-cyan-400',
        badge: '极速',
        badgeBg: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
    },
    {
        icon: Cloud,
        title: '私密收藏与云端同步',
        desc: '跨设备手机/电脑/平板无缝续播与记录',
        color: 'text-blue-400',
        badge: '跨端',
        badgeBg: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
    },
    {
        icon: Gift,
        title: '邀请裂变送 15 天 VIP',
        desc: '每成功邀请 1 人双方各赠送 15 天 VIP',
        color: 'text-emerald-400',
        badge: '免费领',
        badgeBg: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
    },
];

export function VipPrompt({ asModal = false, onClose, onOpenLogin }: VipPromptProps) {
    const { user, refreshProfile } = useUserStore();
    const [tab, setTab] = useState<'benefits' | 'redeem'>('benefits');
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
        <div className={`relative ${asModal ? 'py-4' : 'min-h-[85vh] py-8 sm:py-12'} flex items-center justify-center px-4`}>
            {/* 深邃黑曜石与奢华流光背景 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[160px]" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            </div>

            {/* 主容器：桌面端双栏 / 移动端单栏 */}
            <div className="relative z-10 w-full max-w-5xl mx-auto bg-gradient-to-b from-[#14121a]/95 via-[#0e0c14]/95 to-[#07060a]/95 backdrop-blur-2xl rounded-3xl border border-amber-500/20 shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.08)] p-6 sm:p-8 md:p-10">
                
                {/* 弹窗模式关闭按钮 */}
                {asModal && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer z-20"
                    >
                        <X size={18} />
                    </button>
                )}

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    
                    {/* 左侧：3D 黑金 VIP 通行证卡片 */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="w-full relative group">
                            {/* 卡片流光外发光 */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-orange-500/30 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* 黑金卡片主体 */}
                            <div className="relative rounded-2xl bg-gradient-to-br from-neutral-900 via-[#181524] to-black p-6 sm:p-7 border border-amber-400/40 shadow-2xl overflow-hidden">
                                {/* 装饰斜纹拉丝背景 */}
                                <div className="absolute inset-0 bg-[radial-gradient(#f59e0b0d_1px,transparent_1px)] [background-size:16px_16px]" />
                                <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

                                {/* 卡片头部 */}
                                <div className="flex items-center justify-between relative z-10 mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/40">
                                            <Crown size={20} className="text-black font-black" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                                                iKanPP MIDNIGHT
                                            </div>
                                            <div className="text-[9px] font-bold text-amber-400/60 uppercase tracking-widest">
                                                Black Gold VIP Pass
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                                        尊享特权
                                    </span>
                                </div>

                                {/* VIP 芯片与卡密编号感 */}
                                <div className="relative z-10 space-y-4 my-6">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-7 rounded bg-gradient-to-r from-yellow-600/60 via-amber-400/60 to-yellow-600/60 border border-amber-300/40 shadow-inner flex items-center justify-center">
                                            <div className="w-6 h-4 border border-amber-950/40 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                                                <div className="bg-amber-950/20 rounded-xs" />
                                                <div className="bg-amber-950/20 rounded-xs" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-mono font-bold">
                                            <ShieldCheck size={14} className="text-amber-400" />
                                            <span>2160P UHD VIP</span>
                                        </div>
                                    </div>

                                    <div className="font-mono text-sm sm:text-base font-bold text-amber-100/90 tracking-widest flex justify-between pt-1">
                                        <span>VIP</span>
                                        <span>••••</span>
                                        <span>8888</span>
                                        <span>2026</span>
                                    </div>
                                </div>

                                {/* 卡片底部 */}
                                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px]">
                                    <div className="text-white/60">
                                        状态：{isVip ? <span className="text-emerald-400 font-bold">已开通尊享</span> : <span className="text-amber-400 font-bold">待激活体验</span>}
                                    </div>
                                    <div className="text-white/40">
                                        {isVip ? `至 ${vipExpiry}` : '30 天免单体验'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 返回首页快捷链接（非弹窗模式） */}
                        {!asModal && (
                            <Link
                                href="/"
                                className="mt-5 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-amber-300 transition-colors group"
                            >
                                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                                <span>返回通用影视主站首页</span>
                            </Link>
                        )}
                    </div>

                    {/* 右侧：特权矩阵与互动激活区 */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 标题栏 */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
                                <Sparkles size={13} />
                                <span>午夜版 18+ 尊荣特权专区</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                                解锁全网 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">36 条午夜顶级专线</span>
                            </h2>
                            <p className="text-white/50 text-xs sm:text-sm mt-1.5">
                                原生 4K (2160P) 极清画质 · S1/MOODYZ 原盘厂牌 · 零广告专线秒播
                            </p>
                        </div>

                        {/* Tab 切换 */}
                        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                            <button
                                onClick={() => setTab('benefits')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    tab === 'benefits'
                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/20 font-black'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                <Crown size={14} />
                                <span>尊享特权 ({VIP_BENEFITS_GRID.length})</span>
                            </button>
                            <button
                                onClick={() => setTab('redeem')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    tab === 'redeem'
                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/20 font-black'
                                        : 'text-white/60 hover:text-white'
                                }`}
                            >
                                <Key size={14} />
                                <span>卡密激活 / 兑换码</span>
                            </button>
                        </div>

                        {tab === 'benefits' ? (
                            <>
                                {/* 6 大核心特权双列网格 */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {VIP_BENEFITS_GRID.map((item, i) => (
                                        <div
                                            key={i}
                                            className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/30 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
                                                        <item.icon size={16} />
                                                    </div>
                                                    <span className="text-white font-bold text-xs sm:text-sm">{item.title}</span>
                                                </div>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold ${item.badgeBg}`}>
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <p className="text-white/40 text-[11px] leading-relaxed pl-8">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* 底部操作区 */}
                                <div className="pt-2 space-y-3">
                                    {isLoggedIn ? (
                                        <>
                                            <button
                                                onClick={handleCopyInvite}
                                                className="w-full py-3.5 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-95"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check size={18} className="stroke-[3]" />
                                                        <span>已复制专属邀请链接！</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={18} />
                                                        <span>分享专属邀请码 · 永久赚取 VIP 天数</span>
                                                    </>
                                                )}
                                            </button>
                                            {inviteCode && (
                                                <p className="text-center text-white/50 text-xs">
                                                    您的专属邀请码：<span className="text-amber-400 font-mono font-bold text-sm mx-1">{inviteCode}</span> · 每成功邀请 1 人双方各 +15 天 VIP
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={onOpenLogin}
                                                className="w-full py-3.5 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-95"
                                            >
                                                <LogIn size={18} />
                                                <span>登录 / 注册立即解锁 30 天 VIP 体验</span>
                                            </button>
                                            <p className="text-center text-amber-300/70 text-xs flex items-center justify-center gap-1.5">
                                                <Gift size={13} className="text-amber-400" />
                                                <span>新用户注册即赠送 <strong className="text-amber-400 font-bold">30 天全功能 VIP</strong> 体验卡</span>
                                            </p>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* 卡密激活 Tab */
                            <form onSubmit={handleRedeem} className="space-y-4 py-2">
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs text-white/60">
                                    <div className="font-bold text-white/80 flex items-center gap-1.5">
                                        <Key size={14} className="text-amber-400" />
                                        <span>卡密激活说明</span>
                                    </div>
                                    <p>如果您在合作发卡平台、TG频道或活动中获取了 VIP 激活卡密，可在下方直接核销充值。</p>
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardCode}
                                        onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                                        placeholder="输入 16 位激活卡密 (如 IKAN-XXXX-XXXX-XXXX)"
                                        disabled={redeemLoading}
                                        className="w-full h-12 px-4 pl-11 rounded-2xl bg-black/60 border border-amber-500/30 text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all uppercase"
                                    />
                                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60 pointer-events-none" />
                                </div>

                                {redeemStatus && (
                                    <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border animate-fade-in ${
                                        redeemStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                    }`}>
                                        {redeemStatus.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                                        <span>{redeemStatus.text}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={redeemLoading || !cardCode.trim()}
                                    className="w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {redeemLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>正在核销卡密并授权 VIP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Crown size={18} />
                                            <span>立即激活兑换 VIP 特权</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
