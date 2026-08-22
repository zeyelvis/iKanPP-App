import { useState } from 'react';
import { Crown, Sparkles, Film, Search, Cloud, Gift, Copy, Check, LogIn, X, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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

// VIP 特权列表
const VIP_BENEFITS = [
    { icon: Film, label: '解锁午夜版专属内容', color: 'text-purple-400' },
    { icon: Search, label: '全网影视 Premium 搜索', color: 'text-blue-400' },
    { icon: Cloud, label: '收藏 · 历史 · 云同步', color: 'text-cyan-400' },
    { icon: Sparkles, label: '4K超清画质优先加载', color: 'text-amber-400' },
    { icon: Gift, label: '邀请好友赚更多 VIP', color: 'text-rose-400' },
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
            setRedeemStatus({ type: 'error', text: '请先登录' });
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
                setRedeemStatus({ type: 'success', text: data.message || '🎉 激活成功！' });
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
        <div className={`relative ${asModal ? '' : 'min-h-[70vh]'} flex items-center justify-center`}>
            {/* 背景 */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{
                background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 30%, #302b63 60%, #24243e 100%)',
            }}>
                <div className="absolute top-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]" />
            </div>

            {/* 内容卡片 */}
            <div className="relative z-10 w-full max-w-lg mx-auto p-6 sm:p-8 md:p-10">
                {/* 关闭按钮 */}
                {asModal && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                )}

                {/* VIP 皇冠 */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Crown size={32} className="text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 animate-ping opacity-20" />
                    </div>
                </div>

                {/* 标题 */}
                <h2 className="text-center text-xl sm:text-2xl font-black text-white mb-1">
                    开通 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">VIP</span> 会员
                </h2>
                <p className="text-center text-white/50 text-xs sm:text-sm mb-5">
                    {isVip ? `您的 VIP 有效期至 ${vipExpiry}` : '解锁全站 4K、午夜专区与专属极速解析'}
                </p>

                {/* Tab 切换 */}
                <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/10">
                    <button
                        onClick={() => setTab('benefits')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            tab === 'benefits' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-md' : 'text-white/60 hover:text-white'
                        }`}
                    >
                        会员特权
                    </button>
                    <button
                        onClick={() => setTab('redeem')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            tab === 'redeem' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-md' : 'text-white/60 hover:text-white'
                        }`}
                    >
                        卡密激活
                    </button>
                </div>

                {tab === 'benefits' ? (
                    <>
                        {/* 特权列表 */}
                        <div className="space-y-2.5 mb-6">
                            {VIP_BENEFITS.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/5"
                                >
                                    <div className={`p-1.5 rounded-lg bg-white/5 ${item.color}`}>
                                        <item.icon size={16} />
                                    </div>
                                    <span className="text-white/80 text-xs sm:text-sm font-medium">{item.label}</span>
                                    <Check size={14} className="ml-auto text-emerald-400/70" />
                                </div>
                            ))}
                        </div>

                        {/* 操作区 */}
                        <div className="space-y-3">
                            {isLoggedIn ? (
                                <>
                                    <button
                                        onClick={handleCopyInvite}
                                        className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95"
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={16} />
                                                已复制邀请链接！
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                分享邀请码获取 VIP 天数
                                            </>
                                        )}
                                    </button>
                                    {inviteCode && (
                                        <p className="text-center text-white/40 text-[11px]">
                                            您的邀请码：<span className="text-amber-400 font-mono font-bold">{inviteCode}</span> · 每成功邀请 1 人双方各 +15 天 VIP
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onOpenLogin}
                                        className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95"
                                    >
                                        <LogIn size={16} />
                                        登录 / 注册
                                    </button>
                                    <p className="text-center text-white/40 text-[11px]">
                                        新用户注册即送 <span className="text-amber-400 font-bold">30 天 VIP</span> 体验
                                    </p>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    /* 卡密兑换 Tab */
                    <form onSubmit={handleRedeem} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={cardCode}
                                onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                                placeholder="输入激活卡密 (如 IKAN-XXXX-XXXX-XXXX)"
                                disabled={redeemLoading}
                                className="w-full h-11 px-4 pl-10 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-all uppercase"
                            />
                            <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>

                        {redeemStatus && (
                            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
                                redeemStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            }`}>
                                {redeemStatus.type === 'success' ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
                                <span>{redeemStatus.text}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={redeemLoading || !cardCode.trim()}
                            className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {redeemLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>正在核销卡密...</span>
                                </>
                            ) : (
                                <>
                                    <Crown size={16} />
                                    <span>立即激活兑换</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
