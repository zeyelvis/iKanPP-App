/**
 * Footer — 全局影院级页脚
 * 包含全站 5 大独立频道大厅、客户端下载、SEO 场景词与合规入口
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // 严密隔离：凡是午夜专区 (ikanx.com 域名、/premium 路径或带有 premium=1 的播放页)，100% 严禁渲染主站页脚
  if (typeof window !== 'undefined') {
    const isIkanXHost = window.location.hostname.includes('ikanx.com');
    const isPremiumSearch = window.location.search.includes('premium=1');
    const isPremiumPath = window.location.pathname.startsWith('/premium');
    if (isIkanXHost || isPremiumSearch || isPremiumPath) {
      return null;
    }
  }

  // 服务端预渲染 (SSR) 阶段与客户端识别 /premium 及短剧播放器 /short/player 路由
  if (pathname?.startsWith('/premium') || pathname?.startsWith('/short/player')) {
    return null;
  }

  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#0A0A0F]/95 text-white/70 overflow-hidden">
      {/* 顶部环境流光装饰线 */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(229,9,20,0.5) 20%, rgba(245,158,11,0.6) 50%, rgba(229,9,20,0.5) 80%, transparent)',
        }}
      />

      <div className="fluid-container py-12">
        {/* 顶部列阵 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          {/* 品牌区 */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #FF4D4D 0%, #F59E0B 50%, #FFD700 100%)',
                }}
              >
                <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span
                className="text-2xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #FF4D4D 0%, #F59E0B 50%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                iKanPP
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              专为全球海外华人打造的高清影视聚合平台。
              覆盖院线电影、热播电视剧、动漫新番、热门综艺与全国电视直播，免翻墙极速畅享。
            </p>
          </div>

          {/* 影视核心频道大厅 */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
              影视频道大厅
            </h4>
            <nav className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/movie" className="hover:text-white transition-colors">🎬 电影大厅</Link>
              <Link href="/tv" className="hover:text-white transition-colors">📺 电视剧集</Link>
              <Link href="/anime" className="hover:text-white transition-colors">⚡ 动漫新番</Link>
              <Link href="/variety" className="hover:text-white transition-colors">🎤 综艺娱乐</Link>
              <Link href="/ranking" className="hover:text-white transition-colors">🏆 影视风云榜</Link>
              <Link href="/iptv" className="hover:text-white transition-colors">📡 电视直播</Link>
            </nav>
          </div>

          {/* 服务与支持 */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
              服务与下载
            </h4>
            <nav className="flex flex-col gap-2 text-xs">
              <Link href="/download" className="hover:text-white transition-colors">App 客户端下载</Link>
              <Link href="/about" className="hover:text-white transition-colors">关于平台</Link>
              <Link href="/faq" className="hover:text-white transition-colors">常见问题帮助</Link>
              <Link href="/referral" className="hover:text-white transition-colors">邀请好友</Link>
              <Link href="/profile" className="hover:text-white transition-colors">个人中心</Link>
            </nav>
          </div>

          {/* 法律与合规 */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
              联系与合规
            </h4>
            <div className="space-y-2 text-xs text-white/50">
              <p>
                官方联系邮箱：{' '}
                <a href="mailto:zeyelvis@icloud.com" className="text-white/80 hover:text-white underline">
                  zeyelvis@icloud.com
                </a>
              </p>
              <p className="text-[11px] text-white/30">
                本站所有资源均收集自第三方公开搜索引擎，不存储任何物理音视频文件。版权投诉 48 小时内处理。
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Link href="/terms" className="hover:text-white text-[11px]">服务条款</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-white text-[11px]">隐私政策</Link>
              </div>
            </div>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <p>© 2024–{currentYear} iKanPP.com · All Rights Reserved.</p>
          <p>全球海外华人影视搜索引擎 · 4K 极速秒播</p>
        </div>
      </div>
    </footer>
  );
}
