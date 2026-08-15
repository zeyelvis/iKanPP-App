/**
 * Footer — 网站底部
 * 专业级设计：毛玻璃质感 + 渐变装饰 + 精致排版
 * 非 sticky，跟随页面内容自然排列在底部
 */

'use client';

import Link from 'next/link';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-16 overflow-hidden">
            {/* 顶部渐变装饰线 */}
            <div className="h-px w-full" style={{
                background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.4) 20%, rgba(167,139,250,0.5) 50%, rgba(96,165,250,0.4) 80%, transparent)',
            }} />

            {/* 主体区域：深色毛玻璃背景 */}
            <div style={{
                background: 'linear-gradient(180deg, var(--background-color) 0%, color-mix(in srgb, var(--background-color) 95%, #000) 100%)',
            }}>
                <div className="fluid-container">

                    {/* 上层：品牌 + 导航 + 快捷说明 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10">

                        {/* 品牌区 */}
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-2.5 mb-3">
                                {/* Logo 图标 */}
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #FFB020, #E67E22)',
                                        boxShadow: '0 0 20px rgba(245,158,11,0.25)',
                                    }}>
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight" style={{
                                    background: 'linear-gradient(135deg, #FFB020, #F59E0B, #E67E22)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>iKanPP</span>
                            </div>
                            <p className="text-[13px] leading-relaxed opacity-50" style={{ color: 'var(--text-color-secondary)' }}>
                                爱看片片，精彩无限。<br />
                                提供便捷的在线观影体验，让好片触手可及。
                            </p>
                        </div>

                        {/* 快捷导航 */}
                        <div className="md:col-span-3 md:col-start-7">
                            <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-40" style={{ color: 'var(--text-color)' }}>
                                导航
                            </h4>
                            <nav className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                {[
                                    { label: '首页', href: '/' },
                                    { label: '关于我们', href: '/about' },
                                    { label: '常见问题', href: '/faq' },
                                    { label: '客户端', href: '/download' },
                                    { label: '直播', href: '/iptv' },
                                    { label: '个人中心', href: '/profile' },
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-200"
                                        style={{ color: 'var(--text-color-secondary)' }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* 联系方式 */}
                        <div className="md:col-span-3">
                            <h4 className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-40" style={{ color: 'var(--text-color)' }}>
                                联系我们
                            </h4>
                            <div className="space-y-2.5">
                                <a href="mailto:zeyelvis@icloud.com"
                                    className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity duration-200 group"
                                    style={{ color: 'var(--text-color-secondary)' }}>
                                    <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M22 4L12 13 2 4" />
                                    </svg>
                                    zeyelvis@icloud.com
                                </a>
                                <p className="text-[11px] opacity-30" style={{ color: 'var(--text-color-secondary)' }}>
                                    版权投诉48小时内处理
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 分隔线 */}
                    <div className="h-px w-full" style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)',
                    }} />

                    {/* 免责声明 */}
                    <div className="py-6">
                        <div className="flex items-start gap-2 mb-2">
                            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-color-secondary)' }}>
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                            <p className="text-[11px] leading-[1.8] opacity-35" style={{ color: 'var(--text-color-secondary)' }}>
                                <span className="font-medium opacity-80">免责声明：</span>
                                本站所有视频和图片均来自互联网收集，版权归原创者所有。本网站仅提供 Web 页面服务，不提供资源存储，也不参与录制、上传。若本站收录的节目无意侵犯了贵司版权，请附上版权证明邮件至
                                <a href="mailto:zeyelvis@icloud.com" className="mx-1 opacity-80 hover:opacity-100 transition-opacity" style={{ color: '#60a5fa' }}>
                                    zeyelvis@icloud.com
                                </a>
                                （我们会在收到邮件后 48 小时内删除，谢谢）。
                            </p>
                        </div>
                    </div>

                    {/* 分隔线 */}
                    <div className="h-px w-full" style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)',
                    }} />

                    {/* 底部版权栏 */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-5">
                        <span className="text-[10px] opacity-25" style={{ color: 'var(--text-color-secondary)' }}>
                            © {currentYear} iKanPP. All rights reserved.
                        </span>
                        <div className="flex items-center gap-3 text-[10px] opacity-25" style={{ color: 'var(--text-color-secondary)' }}>
                            <Link href="/terms" className="hover:opacity-100 transition-opacity">用户协议</Link>
                            <span>·</span>
                            <Link href="/privacy" className="hover:opacity-100 transition-opacity">隐私条款</Link>
                            <span>·</span>
                            <Link href="/about" className="hover:opacity-100 transition-opacity">关于我们</Link>
                            <span>·</span>
                            <span>本站内容仅供学习交流</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
