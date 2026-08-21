'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Platform = 'ios' | 'android' | 'macos' | 'windows' | 'tv' | 'unknown';

function detectPlatform(): Platform {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    if (/macintosh|mac os/.test(ua)) return 'macos';
    if (/windows/.test(ua)) return 'windows';
    return 'unknown';
}

const platforms = [
    {
        id: 'ios' as Platform,
        name: 'iOS',
        icon: '📱',
        description: 'iPhone & iPad',
        minVersion: 'iOS 15.0+',
        size: '~8 MB',
        action: '下载 IPA',
        url: '#',
    },
    {
        id: 'android' as Platform,
        name: 'Android',
        icon: '🤖',
        description: '手机 & 平板',
        minVersion: 'Android 8.0+',
        size: '~5 MB',
        action: '下载 APK',
        url: '#',
    },
    {
        id: 'macos' as Platform,
        name: 'macOS',
        icon: '💻',
        description: 'Mac 桌面端',
        minVersion: 'macOS 13.0+',
        size: '~12 MB',
        action: '下载 DMG',
        url: '#',
    },
    {
        id: 'tv' as Platform,
        name: 'TV 版',
        icon: '📺',
        description: 'Android TV & Apple TV',
        minVersion: 'Android TV 8.0+ / tvOS 16+',
        size: '~6 MB',
        action: '下载 TV 版',
        url: '#',
    },
];

export default function DownloadClient() {
    const [currentPlatform, setCurrentPlatform] = useState<Platform>('unknown');

    useEffect(() => {
        setCurrentPlatform(detectPlatform());
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-color)] bg-[image:var(--bg-image)] text-[var(--text-color)] flex flex-col items-center px-5 py-15 font-sans">
            {/* 返回按钮 */}
            <div className="w-full max-w-3xl mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color-secondary)] hover:text-[var(--text-color)] transition-all duration-200 backdrop-blur-xl text-sm"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    返回首页
                </Link>
            </div>

            {/* 头部 */}
            <div className="text-center mb-15">
                <div className="text-5xl font-extrabold mb-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    iKanPP
                </div>
                <p className="text-lg text-[var(--text-color-secondary)] max-w-[500px] leading-relaxed">
                    多源聚合视频平台 · 支持全平台
                </p>
            </div>

            {/* 平台卡片网格 */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 max-w-[1100px] w-full">
                {platforms.map((platform) => {
                    const isRecommended = platform.id === currentPlatform;
                    return (
                        <div
                            key={platform.id}
                            className={`
                                relative flex flex-col items-center text-center p-8 rounded-2xl backdrop-blur-xl
                                transition-all duration-300 cursor-pointer
                                hover:-translate-y-1 hover:shadow-lg
                                ${isRecommended
                                    ? 'bg-[var(--accent-color)]/10 border-2 border-[var(--accent-color)]/40'
                                    : 'bg-[var(--glass-bg)] border border-[var(--glass-border)]'
                                }
                            `}
                        >
                            {isRecommended && (
                                <div className="absolute -top-3 px-4 py-1 rounded-full text-xs font-semibold text-white"
                                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                    推荐当前设备
                                </div>
                            )}

                            <div className="text-5xl mb-4">
                                {platform.icon}
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text-color)] mb-1">
                                {platform.name}
                            </h3>

                            <p className="text-[var(--text-color-secondary)] text-sm mb-4">
                                {platform.description}
                            </p>

                            <div className="flex gap-4 mb-5 text-xs text-[var(--text-color-secondary)] opacity-70">
                                <span>{platform.minVersion}</span>
                                <span>·</span>
                                <span>{platform.size}</span>
                            </div>

                            <a
                                href={platform.url}
                                className={`
                                    inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold
                                    no-underline transition-all duration-200
                                    ${isRecommended
                                        ? 'text-white'
                                        : 'text-[var(--text-color)] bg-[var(--glass-bg)] border border-[var(--glass-border)]'
                                    }
                                `}
                                style={isRecommended ? { background: 'linear-gradient(135deg, #667eea, #764ba2)' } : {}}
                            >
                                ⬇️ {platform.action}
                            </a>
                        </div>
                    );
                })}
            </div>

            {/* Web 提示 */}
            <div className="mt-15 px-10 py-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl backdrop-blur-xl text-center">
                <p className="text-base mb-2">
                    🌐 也可以直接在浏览器中使用
                </p>
                <p className="text-[var(--text-color-secondary)] text-sm">
                    iKanPP 是渐进式 Web 应用（PWA），无需下载，
                    <Link href="/" className="text-[var(--accent-color)] no-underline hover:underline">
                        打开网页版 →
                    </Link>
                </p>
            </div>

            {/* 底部 */}
            <footer className="mt-15 text-[var(--text-color-secondary)] text-xs opacity-50">
                © 2026 iKanPP · 多源聚合视频平台
            </footer>
        </div>
    );
}
