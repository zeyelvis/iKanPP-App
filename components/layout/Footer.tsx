/**
 * Footer — 全局影院级极简页脚 (Netflix 风格)
 * 包含全站 8 大核心频道大厅、客户端下载、服务与合规入口
 * 严格遵循双轨隔离与抗降权规范，结构化语义由首字节 MainSiteJsonLd 全权保障
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

  // 服务端预渲染 (SSR) 阶段与客户端识别 /premium、短剧播放器 /short/player 及管理后台 /admin 路由
  if (pathname?.startsWith('/premium') || pathname?.startsWith('/short/player') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="relative mt-6 sm:mt-8 border-t border-white/10 bg-[#0A0A0F]/95 text-white/70 overflow-hidden">
      {/* 顶部环境流光装饰线 */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(229,9,20,0.5) 20%, rgba(245,158,11,0.6) 50%, rgba(229,9,20,0.5) 80%, transparent)',
        }}
      />

      <div className="fluid-container pt-10 pb-8 space-y-8">
        {/* 核心网格：品牌愿景 + 8 大核心专区 + 服务生态 + 合规申诉 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-white/10">
          {/* 第 1 列：品牌形象与定位（占 5 列） */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #FF4D4D 0%, #F59E0B 50%, #FFD700 100%)',
                }}
              >
                <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span
                className="text-xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #FF4D4D 0%, #F59E0B 50%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                iKanPP · 爱看片片
              </span>
            </div>
            <p className="text-xs text-white/55 leading-relaxed max-w-md">
              专为全球华人及中国大陆影视爱好者打造的一站式超清影视聚合搜索引擎。采用分布式同域边缘网络与多线路智能自愈调度架构，汇聚院线电影、热播剧集、动漫新番与王牌综艺，免翻墙、零广告、秒开即播。
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-white/50">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                全球 Anycast 边缘镜像
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                纯净零广告即搜即播
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                多源毫秒级智能自愈
              </span>
            </div>
          </div>

          {/* 第 2 列：影视核心专区（占 3 列，完整覆盖 8 大一级频道） */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
              影视核心专区
            </h4>
            <nav className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs">
              <Link href="/movie" className="hover:text-white transition-colors">🎬 院线电影</Link>
              <Link href="/tv" className="hover:text-white transition-colors">📺 热播剧集</Link>
              <Link href="/anime" className="hover:text-white transition-colors">⚡ 动漫新番</Link>
              <Link href="/variety" className="hover:text-white transition-colors">🎤 王牌综艺</Link>
              <Link href="/documentary" className="hover:text-white transition-colors">🌏 纪录巨制</Link>
              <Link href="/ranking" className="hover:text-white transition-colors">🏆 影视风云榜</Link>
              <Link href="/short" className="hover:text-white transition-colors">📱 热门短剧</Link>
              <Link href="/iptv" className="hover:text-white transition-colors">📡 电视直播</Link>
            </nav>
          </div>

          {/* 第 3 列：服务与生态（占 2 列） */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
              服务与支持
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs">
              <Link href="/download" className="hover:text-white transition-colors">📱 App 客户端下载</Link>
              <Link href="/faq" className="hover:text-white transition-colors">❓ 常见问题排障 (FAQ)</Link>
              <Link href="/about" className="hover:text-white transition-colors">ℹ️ 关于 iKanPP 平台</Link>
              <Link href="/referral" className="hover:text-white transition-colors">🎁 邀请好友畅享特权</Link>
              <Link href="/sitemap.xml" className="hover:text-white transition-colors">🗺️ 网站地图 (Sitemap)</Link>
            </nav>
          </div>

          {/* 第 4 列：合规与官方联系（占 2 列） */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">
              合规与联系
            </h4>
            <nav className="flex flex-col gap-2.5 text-xs">
              <Link href="/terms" className="hover:text-white transition-colors">📜 服务条款</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">🔒 隐私政策</Link>
              <a
                href="mailto:contact@ikanpp.com"
                className="hover:text-white transition-colors text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5"
              >
                <span>✉️</span>
                <span>官方客服 / 申诉</span>
              </a>
              <span className="text-[11px] text-white/35">
                contact@ikanpp.com
              </span>
            </nav>
          </div>
        </div>

        {/* 底栏：免责声明与版权信息（增加左右避让安全区，杜绝被浮动按钮遮挡） */}
        <div className="space-y-4 text-xs text-white/50 px-8 sm:px-12 md:px-0">
          <p className="text-[11px] text-white/35 leading-relaxed">
            免责声明：iKanPP 为纯粹的非营利性流媒体聚合搜索引擎，所有视频资源均来源于公开网络第三方接口或蜘蛛抓取，本站服务器不存储、不制作任何物理视听文件。若权利方认为内容涉及侵权，请联系官方邮箱 contact@ikanpp.com，我们将在 48 小时内核实并做下架处理。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-white/40 border-t border-white/5">
            <p>© 2024–{currentYear} iKanPP.com · All Rights Reserved.</p>
            <p className="text-white/30">全球海外华人影视聚合搜索引擎 · 纯净 4K 秒播</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

