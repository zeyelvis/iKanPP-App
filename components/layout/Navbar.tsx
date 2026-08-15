'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { siteConfig } from '@/lib/config/site-config';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { getSession, clearSession, hasPermission, type AuthSession } from '@/lib/store/auth-store';
import { LogOut, User, Crown, Share2 } from 'lucide-react';
import { SearchBox } from '@/components/search/SearchBox';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';
import { Button } from '@/components/ui/Button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { AuthModal } from '@/components/auth/AuthModal';
import { useUserStore } from '@/lib/store/user-store';
import { useSessionGuard } from '@/lib/hooks/useSessionGuard';

interface NavbarProps {
    /** 导航模式：'home' 首页模式（搜索+完整功能），'player' 播放页模式（返回按钮+精简功能） */
    variant?: 'home' | 'player';
    onReset?: () => void;
    isPremiumMode?: boolean;
    // 搜索相关 props（仅 home 模式）
    onSearch?: (query: string) => void;
    onClearSearch?: () => void;
    initialQuery?: string;
    isSearching?: boolean;
}

export function Navbar({
    variant = 'home',
    onReset,
    isPremiumMode = false,
    onSearch,
    onClearSearch,
    initialQuery = '',
    isSearching = false,
}: NavbarProps) {
    const router = useRouter();
    const settingsHref = '/profile?tab=player';
    const homeHref = isPremiumMode ? '/premium' : '/';
    const [session, setSessionState] = useState<AuthSession | null>(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [kickedMessage, setKickedMessage] = useState('');
    const { user: supabaseUser, initialize: initUser, logout: supabaseLogout } = useUserStore();

    // 多设备登录守卫
    useSessionGuard();

    // 监听被踢事件
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setKickedMessage(detail?.message || '你的账号已在其他设备登录');
        };
        window.addEventListener('session-kicked', handler);
        return () => window.removeEventListener('session-kicked', handler);
    }, []);

    useEffect(() => {
        setSessionState(getSession());
        initUser();
    }, [initUser]);

    const handleLogout = () => {
        clearSession();
        window.location.href = '/';
    };

    const handleSearch = (query: string) => {
        onSearch?.(query);
        setMobileSearchOpen(false);
    };

    const handleClear = () => {
        onClearSearch?.();
    };

    const isPlayer = variant === 'player';

    return (
        <nav className="sticky top-0 z-[2000] pt-4 pb-2" style={{
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
        }}>
            <div className="fluid-container">
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--shadow-sm)] px-3 sm:px-5 py-2 sm:py-3 rounded-[var(--radius-2xl)]" style={{
                    transform: 'translate3d(0, 0, 0)'
                }}>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Logo */}
                        {isPlayer ? (
                            <button
                                onClick={() => router.push(homeHref)}
                                className="flex items-center justify-center hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
                                title={isPremiumMode ? "返回高级主页" : "返回首页"}
                            >
                                <LogoIcon size={32} />
                            </button>
                        ) : (
                            <Link
                                href={homeHref}
                                className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                                onClick={onReset}
                                data-focusable
                            >
                                <LogoIcon size={32} />
                                <div className="hidden sm:block">
                                    <div className="flex flex-col min-w-0">
                                        <h1 className="text-lg font-bold truncate" style={{
                                            background: 'linear-gradient(135deg, #FFB020, #F59E0B, #E67E22)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            letterSpacing: '0.02em',
                                        }}>iKanPP</h1>
                                        <p className="text-[10px] text-[var(--text-color-secondary)] tracking-wider hidden lg:block">爱看片片 · 精彩无限</p>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* 播放页：返回按钮 */}
                        {isPlayer && (
                            <Button
                                variant="secondary"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                                data-focusable
                            >
                                <Icons.ChevronLeft size={20} />
                                <span className="hidden sm:inline">返回</span>
                            </Button>
                        )}

                        {/* 首页：搜索框 */}
                        {!isPlayer && onSearch && (
                            <>
                                {/* 移动端：搜索图标按钮 */}
                                <button
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="flex sm:!hidden flex-1 items-center gap-2 px-3 py-2 rounded-xl text-sm truncate transition-colors"
                                    style={{
                                        color: 'var(--text-color-secondary)',
                                        background: 'var(--glass-bg, rgba(255,255,255,0.04))',
                                        border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                                    }}
                                >
                                    <Icons.Search size={16} className="shrink-0 opacity-50" />
                                    <span className="truncate opacity-60">
                                        {initialQuery || '搜索电影、电视剧、综艺...'}
                                    </span>
                                </button>
                                {/* 桌面端：内嵌搜索框 */}
                                <div className="hidden sm:block flex-1 min-w-0 max-w-2xl mx-1 sm:mx-auto" style={{ isolation: 'isolate' }}>
                                    <SearchBox
                                        onSearch={handleSearch}
                                        onClear={handleClear}
                                        initialQuery={initialQuery}
                                    />
                                </div>
                            </>
                        )}

                        {/* 中间弹性占位（播放页） */}
                        {isPlayer && <div className="flex-1" />}

                        {/* 右侧图标 */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                            {/* IPTV（仅首页） */}
                            {!isPlayer && hasPermission('iptv_access') && (
                                <Link
                                    href="/iptv"
                                    className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                    aria-label="直播"
                                    title="直播"
                                    data-focusable
                                >
                                    <Icons.TV size={15} className="sm:w-4 sm:h-4" />
                                </Link>
                            )}

                            {!isPlayer && supabaseUser && (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full text-xs hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                        title="个人中心"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] font-bold text-[10px] border border-[var(--glass-border)]">
                                            {supabaseUser.email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[var(--text-color)] max-w-[80px] truncate">{supabaseUser.email.split('@')[0]}</span>
                                        {supabaseUser.isVip && (
                                            <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-medium">
                                                <Crown size={10} />
                                                VIP
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/profile?tab=referral"
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-200 cursor-pointer"
                                        aria-label="邀请好友"
                                        title="邀请好友赚 VIP"
                                    >
                                        <Share2 size={14} />
                                    </Link>
                                </div>
                            )}
                            {!isPlayer && !supabaseUser && (
                                <button
                                    onClick={() => setAuthModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-color)] text-white rounded-full text-xs font-medium hover:opacity-90 transition-all duration-200 cursor-pointer"
                                >
                                    <User size={14} />
                                    登录
                                </button>
                            )}

                            {/* 旧版 Auth 系统用户信息（仅首页桌面端） */}
                            {!isPlayer && session && !supabaseUser && (
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full text-xs">
                                        <div className="w-5 h-5 rounded-full bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] font-bold text-[10px] border border-[var(--glass-border)]">
                                            {session.name.charAt(0)}
                                        </div>
                                        <span className="text-[var(--text-color)] max-w-[60px] truncate">{session.name}</span>
                                        {session.role === 'admin' && (
                                            <span className="px-1 py-0.5 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded text-[10px] font-medium">
                                                管理
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color-secondary)] hover:text-red-500 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                                        aria-label="退出登录"
                                        title="退出登录"
                                    >
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            )}

                            {/* 下载 App（仅首页） */}
                            {!isPlayer && (
                                <Link
                                    href="/download"
                                    className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                    aria-label="下载 App"
                                    title="下载 App"
                                    data-focusable
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                </Link>
                            )}

                            {/* 设置 */}
                            <Link
                                href={settingsHref}
                                className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                                aria-label="设置"
                                data-focusable
                            >
                                <svg className="w-4 h-4" viewBox="0 -960 960 960" fill="currentColor">
                                    <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                                </svg>
                            </Link>

                            {/* 主题切换（播放页显示） */}
                            {isPlayer && <ThemeSwitcher />}
                        </div>
                    </div>
                </div>
            </div>

            {/* 移动端全屏搜索 */}
            {onSearch && (
                <MobileSearchOverlay
                    isOpen={mobileSearchOpen}
                    onClose={() => setMobileSearchOpen(false)}
                    onSearch={handleSearch}
                    initialQuery={initialQuery}
                />
            )}

            {/* 登录/注册弹窗 */}
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

            {/* 被踢出提示弹窗 */}
            {kickedMessage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/15 flex items-center justify-center">
                            <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">设备登录提醒</h3>
                        <p className="text-white/60 text-sm mb-6 leading-relaxed">{kickedMessage}</p>
                        <button
                            onClick={() => { setKickedMessage(''); setAuthModalOpen(true); }}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        >
                            重新登录
                        </button>
                    </div>
                </div>
            )}
        </nav >
    );
}
