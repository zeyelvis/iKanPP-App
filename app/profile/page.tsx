'use client';

/**
 * 统一个人中心 — 合并 Settings + 裂变 + 签到
 * Tab 导航：我的账户 | 邀请好友 | 播放器 | 显示 | 视频源 | 数据管理
 */
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    User, Gift, Film, Palette, Radio, Database,
    Crown, LogOut, Mail, Calendar, Shield, Tv,
    X, MailCheck, Sparkles
} from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import { Navbar } from '@/components/layout/Navbar';
import { CheckInCard } from '@/components/auth/CheckInCard';
import { VipRedeemCard } from '@/components/vip/VipRedeemCard';
import { VipCardManager } from '@/components/admin/VipCardManager';

// Settings 组件复用
import { PlayerSettings } from '@/components/settings/PlayerSettings';
import { DisplaySettings } from '@/components/settings/DisplaySettings';
import { SourceSettings } from '@/components/settings/SourceSettings';
import { SortSettings } from '@/components/settings/SortSettings';
import { DataSettings } from '@/components/settings/DataSettings';
import { UserSourceSettings } from '@/components/settings/UserSourceSettings';
import { UserDanmakuSettings } from '@/components/settings/UserDanmakuSettings';
import { AddSourceModal } from '@/components/settings/AddSourceModal';
import { ExportModal } from '@/components/settings/ExportModal';
import { ImportModal } from '@/components/settings/ImportModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PermissionGate } from '@/components/PermissionGate';
import { hasPermission } from '@/lib/store/auth-store';
import { useSettingsPage } from '@/app/settings/hooks/useSettingsPage';
import { usePremiumSettingsPage } from '@/app/premium/settings/hooks/usePremiumSettingsPage';
import { PremiumSourceSettings } from '@/components/settings/PremiumSourceSettings';
import { IPTVSourceManager } from '@/components/iptv/IPTVSourceManager';

// 裂变 + 管理员组件
import { getReferralRecords, getAdminList, setUserRole, findUserByEmail, type SupabaseRole } from '@/lib/supabase/auth';
import {
    Crown as CrownIcon, Copy, Check, Users, Share2,
    QrCode, Clock, ChevronRight, UserPlus, Trash2, ShieldCheck, ShieldAlert
} from 'lucide-react';

const BASE_TABS = [
    { id: 'account', label: '我的账户', icon: User },
    { id: 'referral', label: '邀请好友', icon: Gift },
    { id: 'player', label: '播放器', icon: Film },
    { id: 'display', label: '显示设置', icon: Palette },
    { id: 'source', label: '视频源', icon: Radio },
    { id: 'data', label: '数据管理', icon: Database },
] as const;

const PREMIUM_TAB = { id: 'premium' as const, label: '高级源', icon: Crown };
const IPTV_TAB = { id: 'iptv' as const, label: '直播源', icon: Tv };
const ADMIN_TAB = { id: 'admin' as const, label: '管理员', icon: Shield };

type TabId = (typeof BASE_TABS)[number]['id'] | 'premium' | 'iptv' | 'admin';

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, initialized, initialize, logout } = useUserStore();
    const [activeTab, setActiveTab] = useState<TabId>(
        (searchParams.get('tab') as TabId) || 'account'
    );
    const [showLogin, setShowLogin] = useState(false);

    // 动态 Tab 列表：普通用户无侧边栏（单页展示），管理员看全部 Tab
    const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin';
    const TABS = isAdminRole ? [
        ...BASE_TABS,
        PREMIUM_TAB,
        IPTV_TAB,
        ...(user?.role === 'super_admin' ? [ADMIN_TAB] : []),
    ] : [];

    useEffect(() => { initialize(); }, [initialize]);

    // 用户登录后自动同步全局视频源配置
    useEffect(() => {
        if (!user) return;
        const syncGlobal = async () => {
            try {
                const { settingsStore, getDefaultSources, getDefaultPremiumSources } = await import('@/lib/store/settings-store');
                // 管理员首次登录时，如果全局配置为空则写入默认值
                if (user.role === 'admin' || user.role === 'super_admin') {
                    const { initGlobalConfigIfEmpty } = await import('@/lib/supabase/global-config');
                    await initGlobalConfigIfEmpty(getDefaultSources(), getDefaultPremiumSources(), user.id);
                }
                // 所有用户：从 Supabase 同步全局源到本地
                await settingsStore.syncGlobalSources();
            } catch (err) {
                console.warn('全局配置同步失败:', err);
            }
        };
        syncGlobal();
    }, [user?.id]);

    // 同步 URL 参数
    useEffect(() => {
        const tab = searchParams.get('tab') as TabId;
        if (tab && TABS.some(t => t.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        window.history.replaceState(null, '', `/profile?tab=${tab}`);
    };

    // Settings hooks
    const settings = useSettingsPage();
    const premiumSettings = usePremiumSettingsPage();

    // VIP 到期时间
    const vipExpiry = user?.vipUntil
        ? new Date(user.vipUntil).toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : null;

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="brand-spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', backgroundImage: 'var(--bg-image)' }}>
            {/* 顶部导航 — 复用全局 Navbar 保持统一 */}
            <Navbar variant="player" />

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-28 sm:pb-12">
                {/* 普通用户：单页展示，无侧边栏 */}
                {!isAdminRole ? (
                    <div className="max-w-2xl mx-auto">
                        {!user ? (
                            <NotLoggedIn onLogin={() => setShowLogin(true)} />
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                {/* VIP 卡片 + 签到 + 邀请好友 + 账号信息 全部单页展示 */}
                                <AccountTab user={user} vipExpiry={vipExpiry} onLogin={() => setShowLogin(true)} />
                                <ReferralTab user={user} />
                                {/* 退出登录 */}
                                <button
                                    onClick={async () => { await logout(); router.push('/'); }}
                                    className="w-full py-3 rounded-xl text-sm font-medium text-red-400 border transition-all cursor-pointer flex items-center justify-center gap-2"
                                    style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.1)' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'}
                                >
                                    <LogOut size={16} />
                                    退出登录
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 管理员：侧边栏 + Tab 布局 */
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        <nav className="lg:w-56 shrink-0">
                            {/* 移动端横向滚动 */}
                            <div className="relative lg:hidden">
                                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide pr-8">
                                    {TABS.map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => handleTabChange(tab.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id
                                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                                    }`}
                                                style={activeTab !== tab.id ? { color: 'var(--text-color-secondary)' } : undefined}
                                            >
                                                <Icon size={14} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="absolute right-0 top-0 bottom-2 w-10 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, var(--bg-color))' }} />
                            </div>

                            {/* 桌面端垂直导航 */}
                            <div className="hidden lg:flex flex-col gap-1 sticky top-20">
                                {user && (
                                    <div className="p-4 mb-3 rounded-2xl relative overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, #1a1040 0%, #0f1729 50%, #1a1040 100%)', border: '1px solid rgba(139,92,246,0.15)' }}>
                                        <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30"
                                            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)' }} />
                                        <div className="relative flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                                {(user.email || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate text-white">
                                                    {user.email?.split('@')[0] || '用户'}
                                                </p>
                                                <p className="text-xs flex items-center gap-1 text-white/60">
                                                    {user.isVip
                                                        ? <><Crown size={10} className="text-amber-400" /> VIP</>
                                                        : '普通用户'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {TABS.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${isActive
                                                ? 'text-amber-400'
                                                : ''
                                                }`}
                                            style={{
                                                color: isActive ? '#fbbf24' : 'var(--text-color-secondary)',
                                                backgroundColor: isActive ? 'rgba(251,191,36,0.1)' : 'transparent',
                                                border: isActive ? '1px solid rgba(251,191,36,0.2)' : '1px solid transparent',
                                            }}
                                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--glass-bg, rgba(255,255,255,0.05))'; }}
                                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    );
                                })}

                                {user && (
                                    <button
                                        onClick={async () => { await logout(); router.push('/'); }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mt-4 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-left border border-transparent"
                                    >
                                        <LogOut size={18} />
                                        退出登录
                                    </button>
                                )}
                            </div>
                        </nav>

                        <main className="flex-1 min-w-0">
                            {activeTab === 'account' && <AccountTab user={user} vipExpiry={vipExpiry} onLogin={() => setShowLogin(true)} />}
                            {activeTab === 'referral' && <ReferralTab user={user} />}
                            {activeTab === 'player' && <PlayerTab settings={settings} />}
                            {activeTab === 'display' && <DisplayTab settings={settings} />}
                            {activeTab === 'source' && <SourceTab settings={settings} />}
                            {activeTab === 'data' && <DataTab settings={settings} />}
                            {activeTab === 'premium' && isAdminRole && <PremiumTab premiumSettings={premiumSettings} settings={settings} />}
                            {activeTab === 'iptv' && isAdminRole && <IPTVTab />}
                            {activeTab === 'admin' && user?.role === 'super_admin' && <AdminTab user={user} />}
                        </main>
                    </div>
                )}
            </div>

            {/* 登录弹窗 */}
            {showLogin && <AuthModal isOpen={showLogin} onClose={() => setShowLogin(false)} />}
        </div>
    );
}

// ─── Tab 内容组件 ───────────────

function NotLoggedIn({ onLogin }: { onLogin: () => void }) {
    return (
        <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Gift size={36} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                登录后查看个人中心
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-color-secondary)' }}>
                注册即送 30 天 VIP，邀请好友双方各得 15 天
            </p>
            <button
                onClick={onLogin}
                className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
                登录 / 注册
            </button>
        </div>
    );
}

// ─── 1. 我的账户 ───
function AccountTab({ user, vipExpiry, onLogin }: { user: any; vipExpiry: string | null; onLogin: () => void }) {
    const [showVerifyBanner, setShowVerifyBanner] = useState(true);
    const [verifyEmailSent, setVerifyEmailSent] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // 检查是否是新注册用户（用于显示邮箱认证提示）
    const isJustRegistered = typeof window !== 'undefined' && localStorage.getItem('kvideo-just-registered') === 'true';
    // 检查邮箱是否已认证（通过 Supabase 的 email_confirmed_at 字段）
    const [emailConfirmed, setEmailConfirmed] = useState(false);

    useEffect(() => {
        async function checkEmailConfirmation() {
            const { supabase } = await import('@/lib/supabase/client');
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser?.email_confirmed_at) {
                setEmailConfirmed(true);
                // 已认证，清除新注册标记
                localStorage.removeItem('kvideo-just-registered');
            }
        }
        checkEmailConfirmation();
    }, []);

    const handleSendVerification = async () => {
        setSendingEmail(true);
        try {
            const { supabase } = await import('@/lib/supabase/client');
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });
            if (error) throw error;
            setVerifyEmailSent(true);
        } catch (err) {
            console.error('发送认证邮件失败:', err);
        } finally {
            setSendingEmail(false);
        }
    };

    if (!user) return <NotLoggedIn onLogin={onLogin} />;

    // 是否显示认证横幅：新注册且未认证且未关闭
    const shouldShowBanner = (isJustRegistered || !emailConfirmed) && !emailConfirmed && showVerifyBanner;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* 邮箱认证提示横幅 */}
            {shouldShowBanner && (
                <div className="relative rounded-2xl overflow-hidden p-4 sm:p-5" style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.08) 100%)',
                    border: '1px solid rgba(251,191,36,0.2)',
                }}>
                    <button
                        onClick={() => { setShowVerifyBanner(false); localStorage.removeItem('kvideo-just-registered'); }}
                        className="absolute top-3 right-3 p-1 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--text-color-secondary)' }}
                    >
                        <X size={14} />
                    </button>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))' }}>
                            <MailCheck size={20} className="text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            {isJustRegistered && !verifyEmailSent && (
                                <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-color)' }}>
                                    🎉 注册成功！已赠送 30 天 VIP 体验
                                </p>
                            )}
                            <p className="text-sm" style={{ color: 'var(--text-color)' }}>
                                认证邮箱可额外获得 <span className="text-amber-400 font-bold">7 天 VIP</span> 奖励
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-color-secondary)' }}>
                                完成邮箱认证后奖励将自动发放到您的账户
                            </p>
                            {verifyEmailSent ? (
                                <p className="text-xs mt-2 text-emerald-400 flex items-center gap-1">
                                    <Sparkles size={12} /> 认证邮件已发送，请查收邮箱
                                </p>
                            ) : (
                                <button
                                    onClick={handleSendVerification}
                                    disabled={sendingEmail}
                                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all cursor-pointer disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                                >
                                    {sendingEmail ? '发送中...' : '发送认证邮件'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* VIP 状态卡片 — 深色高级渐变 */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 30%, #302b63 60%, #24243e 100%)' }}>
                {/* 装饰光效 */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)' }} />
                <div className="relative p-5 sm:p-8">
                    <div className="flex items-center gap-4 mb-5 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-lg sm:text-2xl"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                            {(user.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-base sm:text-xl truncate text-white">
                                {user.email || '用户'}
                            </p>
                            <p className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-wrap mt-1">
                                {user.isVip ? (
                                    <span className="flex items-center gap-1.5 text-amber-300">
                                        <Crown size={14} className="text-amber-400" />
                                        <span className="font-medium">VIP</span>
                                        <span className="text-white/40">·</span>
                                        <span className="text-white/50">{vipExpiry}</span>
                                    </span>
                                ) : (
                                    <span className="text-white/40">签到或邀请好友获得 VIP</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-xl sm:text-3xl font-bold text-amber-400">{user.totalInvites || 0}</p>
                            <p className="text-[10px] sm:text-xs mt-1 text-white/40">已邀请</p>
                        </div>
                        <div className="text-center p-3 sm:p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-xl sm:text-3xl font-bold">
                                {user.isVip ? <span className="text-emerald-400">✓</span> : <span className="text-red-400/60">✗</span>}
                            </p>
                            <p className="text-[10px] sm:text-xs mt-1 text-white/40">VIP 状态</p>
                        </div>
                        <div className="text-center p-3 sm:p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-base sm:text-2xl font-bold font-mono tracking-wider text-blue-400">{user.inviteCode || '—'}</p>
                            <p className="text-[10px] sm:text-xs mt-1 text-white/40">邀请码</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* VIP 卡密兑换与权益展示 */}
            <VipRedeemCard />

            {/* 每日签到 */}
            <CheckInCard />

            {/* 账号信息 */}
            <div className="rounded-2xl p-4 sm:p-6" style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border, rgba(255,255,255,0.08))' }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Mail size={18} className="text-blue-400" />
                    账号信息
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--glass-bg)' }}>
                        <span className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>邮箱</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--glass-bg)' }}>
                        <span className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>注册时间</span>
                        <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-color)' }}>
                            <Calendar size={12} style={{ color: 'var(--text-color-secondary)' }} />
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '—'}
                        </span>
                    </div>
                    {user.role && (user.role === 'admin' || user.role === 'super_admin') && (
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--glass-bg)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>角色</span>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                                style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                                <Shield size={10} />
                                {user.role === 'super_admin' ? '超级管理员' : '管理员'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 移动端退出登录 */}
            <button
                onClick={async () => { const { useUserStore } = await import('@/lib/store/user-store'); await useUserStore.getState().logout(); window.location.href = '/'; }}
                className="lg:hidden w-full py-3 rounded-xl text-sm font-medium text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
                <LogOut size={16} />
                退出登录
            </button>
        </div>
    );
}

// ─── 2. 邀请好友 ───
function ReferralTab({ user }: { user: any }) {
    interface ReferralRecord {
        id: string; invitee_id: string; reward_days: number; type: string;
        created_at: string; invitee?: { email: string };
    }
    const [records, setRecords] = useState<ReferralRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    useEffect(() => {
        if (user?.id) {
            setLoadingRecords(true);
            getReferralRecords(user.id)
                .then((data) => setRecords(data as ReferralRecord[]))
                .catch(console.error)
                .finally(() => setLoadingRecords(false));
        }
    }, [user?.id]);

    const inviteLink = user?.inviteCode
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${user.inviteCode}`
        : '';

    const copyText = async (text: string, setter: (v: boolean) => void) => {
        try { await navigator.clipboard.writeText(text); }
        catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    const totalDays = records.reduce((sum, r) => sum + (r.reward_days || 0), 0);

    if (!user) return null;

    return (
        <div className="space-y-6">
            {/* 邀请统计 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                    { value: user.totalInvites || 0, label: '已邀请', color: 'text-amber-400' },
                    { value: totalDays, label: 'VIP 天数', color: 'text-emerald-400' },
                    { value: '∞', label: '可邀请', color: 'text-blue-400' },
                ].map(s => (
                    <div key={s.label} className="text-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5" style={{ backgroundColor: 'var(--glass-bg)' }}>
                        <p className={`text-lg sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-color-secondary)' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* 邀请码 */}
            <div className="rounded-2xl p-4 sm:p-6 border border-white/5" style={{ backgroundColor: 'var(--glass-bg)' }}>
                <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base" style={{ color: 'var(--text-color)' }}>
                    <QrCode size={16} className="text-amber-400" />
                    你的邀请码
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl font-mono font-bold tracking-[0.2em] sm:tracking-[0.3em] text-amber-400">
                        {user.inviteCode}
                    </span>
                    <button onClick={() => copyText(user.inviteCode, setCopiedCode)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                        {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} style={{ color: 'var(--text-color-secondary)' }} />}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <button onClick={() => copyText(inviteLink, setCopied)}
                        className="py-2.5 sm:py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]">
                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                        {copied ? '已复制' : '复制邀请链接'}
                    </button>
                    <button onClick={() => copyText(user.inviteCode, setCopiedCode)}
                        className="py-2.5 sm:py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 active:scale-[0.98]"
                        style={{ color: 'var(--text-color)' }}>
                        {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                        {copiedCode ? '已复制' : '复制邀请码'}
                    </button>
                </div>
            </div>

            {/* 邀请规则 */}
            <div className="rounded-2xl p-4 sm:p-6 border border-white/5" style={{ backgroundColor: 'var(--glass-bg)' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Gift size={18} className="text-purple-400" />
                    邀请规则
                </h3>
                <div className="space-y-3">
                    {[
                        { step: '1', text: '分享你的邀请码或链接给好友', color: 'text-blue-400' },
                        { step: '2', text: '好友注册时填写你的邀请码', color: 'text-emerald-400' },
                        { step: '3', text: '好友注册成功，双方各得 15 天 VIP', color: 'text-amber-400' },
                    ].map(item => (
                        <div key={item.step} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-white/5 ${item.color}`}>{item.step}</div>
                            <span className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>{item.text}</span>
                            {item.step !== '3' && <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--text-color-secondary)' }} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* 邀请记录 */}
            <div className="rounded-2xl p-4 sm:p-6 border border-white/5" style={{ backgroundColor: 'var(--glass-bg)' }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Users size={18} className="text-cyan-400" />
                    邀请记录
                    {records.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{records.length} 人</span>}
                </h3>
                {loadingRecords ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" /></div>
                ) : records.length === 0 ? (
                    <div className="text-center py-8">
                        <Users size={40} className="mx-auto mb-3 text-white/10" />
                        <p className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>暂无邀请记录</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {records.map(record => (
                            <div key={record.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Gift size={14} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                                            {record.invitee?.email ? record.invitee.email.replace(/(.{2}).*(@.*)/, '$1***$2') : '新用户'}
                                        </p>
                                        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-color-secondary)' }}>
                                            <Clock size={10} />
                                            {new Date(record.created_at).toLocaleDateString('zh-CN')}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-amber-400">+{record.reward_days}天</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── 3. 播放器设置 ───
function PlayerTab({ settings }: { settings: ReturnType<typeof useSettingsPage> }) {
    return (
        <PermissionGate permission="player_settings">
            <PlayerSettings
                fullscreenType={settings.fullscreenType}
                onFullscreenTypeChange={settings.handleFullscreenTypeChange}
                proxyMode={settings.proxyMode}
                onProxyModeChange={settings.handleProxyModeChange}
                danmakuApiUrl={settings.danmakuApiUrl}
                onDanmakuApiUrlChange={settings.handleDanmakuApiUrlChange}
                danmakuOpacity={settings.danmakuOpacity}
                onDanmakuOpacityChange={settings.handleDanmakuOpacityChange}
                danmakuFontSize={settings.danmakuFontSize}
                onDanmakuFontSizeChange={settings.handleDanmakuFontSizeChange}
                danmakuDisplayArea={settings.danmakuDisplayArea}
                onDanmakuDisplayAreaChange={settings.handleDanmakuDisplayAreaChange}
                showDanmakuApi={hasPermission('danmaku_api')}
            />
        </PermissionGate>
    );
}

// ─── 4. 显示设置 ───
function DisplayTab({ settings }: { settings: ReturnType<typeof useSettingsPage> }) {
    return (
        <DisplaySettings
            realtimeLatency={settings.realtimeLatency}
            searchDisplayMode={settings.searchDisplayMode}
            rememberScrollPosition={settings.rememberScrollPosition}
            onRealtimeLatencyChange={settings.handleRealtimeLatencyChange}
            onSearchDisplayModeChange={settings.handleSearchDisplayModeChange}
            onRememberScrollPositionChange={settings.handleRememberScrollPositionChange}
        />
    );
}

// ─── 5. 视频源管理 ───
function SourceTab({ settings }: { settings: ReturnType<typeof useSettingsPage> }) {
    return (
        <div className="space-y-6">
            <UserSourceSettings />
            <UserDanmakuSettings />
            <PermissionGate permission="source_management">
                <SourceSettings
                    sources={settings.sources}
                    onSourcesChange={settings.handleSourcesChange}
                    onRestoreDefaults={() => settings.setIsRestoreDefaultsDialogOpen(true)}
                    onAddSource={() => { settings.setEditingSource(null); settings.setIsAddModalOpen(true); }}
                    onEditSource={settings.handleEditSource}
                />
            </PermissionGate>
            <SortSettings sortBy={settings.sortBy} onSortChange={settings.handleSortChange} />

            {/* Modals */}
            <AddSourceModal
                isOpen={settings.isAddModalOpen}
                onClose={() => { settings.setIsAddModalOpen(false); settings.setEditingSource(null); }}
                onAdd={settings.handleAddSource}
                existingIds={settings.sources.map(s => s.id)}
                initialValues={settings.editingSource}
            />
            <ConfirmDialog
                isOpen={settings.isRestoreDefaultsDialogOpen}
                title="恢复默认源"
                message="这将重置所有视频源为默认配置。自定义源将被删除。是否继续？"
                confirmText="恢复" cancelText="取消"
                onConfirm={settings.handleRestoreDefaults}
                onCancel={() => settings.setIsRestoreDefaultsDialogOpen(false)}
            />
        </div>
    );
}

// ─── 6. 数据管理 ───
function DataTab({ settings }: { settings: ReturnType<typeof useSettingsPage> }) {
    return (
        <PermissionGate permission="data_management">
            <div className="space-y-6">
                <DataSettings
                    onExport={() => settings.setIsExportModalOpen(true)}
                    onImport={() => settings.setIsImportModalOpen(true)}
                    onReset={() => settings.setIsResetDialogOpen(true)}
                />

                <ExportModal
                    isOpen={settings.isExportModalOpen}
                    onClose={() => settings.setIsExportModalOpen(false)}
                    onExport={settings.handleExport}
                />
                <ImportModal
                    isOpen={settings.isImportModalOpen}
                    onClose={() => settings.setIsImportModalOpen(false)}
                    onImportFile={settings.handleImportFile}
                    onImportLink={settings.handleImportLink}
                    subscriptions={settings.subscriptions}
                    onAddSubscription={settings.handleAddSubscription}
                    onRemoveSubscription={settings.handleRemoveSubscription}
                    onRefreshSubscription={settings.handleRefreshSubscription}
                />
                <ConfirmDialog
                    isOpen={settings.isResetDialogOpen}
                    title="清除所有数据"
                    message="这将删除所有设置、历史记录、Cookie 和缓存。此操作不可撤销。是否继续？"
                    confirmText="清除" cancelText="取消"
                    onConfirm={settings.handleResetAll}
                    onCancel={() => settings.setIsResetDialogOpen(false)}
                    dangerous
                />
            </div>
        </PermissionGate>
    );
}

// ─── 7. 高级源管理（仅管理员可见） ───
function PremiumTab({ premiumSettings, settings }: {
    premiumSettings: ReturnType<typeof usePremiumSettingsPage>;
    settings: ReturnType<typeof useSettingsPage>;
}) {
    return (
        <div className="space-y-6">
            {/* Premium 视频源管理 */}
            <PremiumSourceSettings
                sources={premiumSettings.premiumSources}
                onSourcesChange={premiumSettings.handleSourcesChange}
                onRestoreDefaults={() => premiumSettings.setIsRestoreDefaultsDialogOpen(true)}
                onAddSource={() => { premiumSettings.setEditingSource(null); premiumSettings.setIsAddModalOpen(true); }}
                onEditSource={premiumSettings.handleEditSource}
            />

            {/* Premium 播放器设置 */}
            <PlayerSettings
                fullscreenType={premiumSettings.fullscreenType}
                onFullscreenTypeChange={premiumSettings.handleFullscreenTypeChange}
                proxyMode={premiumSettings.proxyMode}
                onProxyModeChange={premiumSettings.handleProxyModeChange}
                danmakuApiUrl={premiumSettings.danmakuApiUrl}
                onDanmakuApiUrlChange={premiumSettings.handleDanmakuApiUrlChange}
                danmakuOpacity={premiumSettings.danmakuOpacity}
                onDanmakuOpacityChange={premiumSettings.handleDanmakuOpacityChange}
                danmakuFontSize={premiumSettings.danmakuFontSize}
                onDanmakuFontSizeChange={premiumSettings.handleDanmakuFontSizeChange}
                danmakuDisplayArea={premiumSettings.danmakuDisplayArea}
                onDanmakuDisplayAreaChange={premiumSettings.handleDanmakuDisplayAreaChange}
                showDanmakuApi={true}
            />

            {/* Premium 显示设置 */}
            <DisplaySettings
                realtimeLatency={premiumSettings.realtimeLatency}
                searchDisplayMode={premiumSettings.searchDisplayMode}
                rememberScrollPosition={premiumSettings.rememberScrollPosition}
                onRealtimeLatencyChange={premiumSettings.handleRealtimeLatencyChange}
                onSearchDisplayModeChange={premiumSettings.handleSearchDisplayModeChange}
                onRememberScrollPositionChange={premiumSettings.handleRememberScrollPositionChange}
            />

            {/* Modals */}
            <AddSourceModal
                isOpen={premiumSettings.isAddModalOpen}
                onClose={() => { premiumSettings.setIsAddModalOpen(false); premiumSettings.setEditingSource(null); }}
                onAdd={premiumSettings.handleAddSource}
                existingIds={premiumSettings.premiumSources.map(s => s.id)}
                initialValues={premiumSettings.editingSource}
            />
            <ConfirmDialog
                isOpen={premiumSettings.isRestoreDefaultsDialogOpen}
                title="恢复默认高级源"
                message="这将重置所有高级视频源为默认配置。自定义源将被删除。是否继续？"
                confirmText="恢复" cancelText="取消"
                onConfirm={premiumSettings.handleRestoreDefaults}
                onCancel={() => premiumSettings.setIsRestoreDefaultsDialogOpen(false)}
            />
        </div>
    );
}

// ─── 8. 直播源管理（仅管理员可见） ───
function IPTVTab() {
    return (
        <div className="space-y-6">
            <div className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl">
                <IPTVSourceManager />
            </div>
        </div>
    );
}

// ─── 9. 管理员管理（仅 super_admin 可见） ───
function AdminTab({ user }: { user: any }) {
    const [admins, setAdmins] = useState<{ id: string; email: string; role: SupabaseRole }[]>([]);
    const [loading, setLoading] = useState(true);
    const [addEmail, setAddEmail] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

    const loadAdmins = async () => {
        setLoading(true);
        try {
            const list = await getAdminList();
            setAdmins(list);
        } catch (err) {
            console.error('加载管理员列表失败:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAdmins(); }, []);

    const handleAddAdmin = async () => {
        if (!addEmail.trim()) return;
        setAddLoading(true);
        setMessage(null);
        try {
            const target = await findUserByEmail(addEmail.trim());
            if (!target) {
                setMessage({ type: 'error', text: '未找到该邮箱对应的用户' });
                return;
            }
            if (target.role === 'admin' || target.role === 'super_admin') {
                setMessage({ type: 'error', text: '该用户已是管理员' });
                return;
            }
            const result = await setUserRole(target.id, 'admin', user.id);
            if (result.success) {
                setMessage({ type: 'success', text: `已将 ${target.email} 设为管理员` });
                setAddEmail('');
                await loadAdmins();
            } else {
                setMessage({ type: 'error', text: result.error || '操作失败' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || '操作失败' });
        } finally {
            setAddLoading(false);
        }
    };

    const handleRemoveAdmin = async (targetId: string) => {
        setMessage(null);
        try {
            const result = await setUserRole(targetId, 'user', user.id);
            if (result.success) {
                setMessage({ type: 'success', text: '已移除管理员权限' });
                setConfirmRemove(null);
                await loadAdmins();
            } else {
                setMessage({ type: 'error', text: result.error || '操作失败' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || '操作失败' });
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* VIP 卡密管理中心（生成/核销/查询/作废） */}
            <VipCardManager />

            {/* 提示信息 */}
            {message && (
                <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                    {message.text}
                </div>
            )}

            {/* 添加管理员 */}
            <div className="rounded-2xl p-4 sm:p-6 border border-white/5" style={{ backgroundColor: 'var(--glass-bg)' }}>
                <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <UserPlus size={18} className="text-blue-400" />
                    添加管理员
                </h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-color-secondary)' }}>
                    输入已注册用户的邮箱地址，将其设为管理员
                </p>
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                        placeholder="user@example.com"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm outline-none focus:border-blue-500/50 transition-colors"
                        style={{ color: 'var(--text-color)' }}
                    />
                    <button
                        onClick={handleAddAdmin}
                        disabled={addLoading || !addEmail.trim()}
                        className="px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                    >
                        {addLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <UserPlus size={14} />
                        )}
                        添加
                    </button>
                </div>
            </div>

            {/* 管理员列表 */}
            <div className="rounded-2xl p-4 sm:p-6 border border-white/5" style={{ backgroundColor: 'var(--glass-bg)' }}>
                <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                    <Shield size={18} className="text-amber-400" />
                    管理员列表
                    {admins.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                            {admins.length} 人
                        </span>
                    )}
                </h3>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
                    </div>
                ) : admins.length === 0 ? (
                    <div className="text-center py-8">
                        <Shield size={40} className="mx-auto mb-3 text-white/10" />
                        <p className="text-sm" style={{ color: 'var(--text-color-secondary)' }}>暂无管理员</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {admins.map(admin => (
                            <div key={admin.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${admin.role === 'super_admin'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {admin.email[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>
                                            {admin.email}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-color-secondary)' }}>
                                            {admin.role === 'super_admin' ? '👑 超级管理员' : '🛡️ 管理员'}
                                        </p>
                                    </div>
                                </div>
                                {admin.role !== 'super_admin' && (
                                    confirmRemove === admin.id ? (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleRemoveAdmin(admin.id)}
                                                className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors cursor-pointer"
                                            >
                                                确认
                                            </button>
                                            <button
                                                onClick={() => setConfirmRemove(null)}
                                                className="px-2.5 py-1 rounded-lg bg-white/5 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
                                                style={{ color: 'var(--text-color-secondary)' }}
                                            >
                                                取消
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmRemove(admin.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                                            title="移除管理员"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 权限说明 */}
            <div className="rounded-2xl p-4 sm:p-6 border border-white/5" style={{ backgroundColor: 'var(--glass-bg)' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2 text-sm" style={{ color: 'var(--text-color)' }}>
                    <ShieldCheck size={16} className="text-emerald-400" />
                    权限说明
                </h3>
                <div className="space-y-2 text-xs" style={{ color: 'var(--text-color-secondary)' }}>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-white/3">
                        <span className="text-amber-400 shrink-0">👑</span>
                        <span><strong className="text-amber-400">超级管理员</strong> — 所有权限 + 添加/移除管理员</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-white/3">
                        <span className="text-blue-400 shrink-0">🛡️</span>
                        <span><strong className="text-blue-400">管理员</strong> — 视频源管理、数据管理、弹幕 API、IPTV</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-white/3">
                        <span className="shrink-0">👤</span>
                        <span><strong>普通用户</strong> — 播放器设置、显示设置</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── 页面入口（Suspense 包裹 searchParams） ───
export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="brand-spinner" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
