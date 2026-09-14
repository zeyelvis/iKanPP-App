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

      <div className="fluid-container py-12 space-y-12">
        {/* 第一层：品牌实体 + 核心使命 + 核心优势特性 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          <div className="lg:col-span-6 space-y-4">
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
                iKanPP · 爱看片片
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-xl">
              iKanPP（爱看片片）是专为全球华人及中国大陆影视爱好者打造的一站式超清影视聚合搜索引擎。平台采用先进的全球同域边缘镜像与多线路智能调度架构，汇聚院线电影、热播电视剧、热门新番、王牌综艺与纪录片巨制，免翻墙、零广告、秒开即播。
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>全球网络秒开架构</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>纯净无流氓插播广告</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>多源智能毫秒级自愈</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>全端自适应支持大屏投屏</span>
            </div>
          </div>
        </div>

        {/* 第二层：24+ 深度链接矩阵（频道大厅、热门类型分类、服务与支持） */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* 核心频道 */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
              影视核心频道
            </h4>
            <nav className="grid grid-cols-2 gap-2 text-xs">
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

          {/* 热门题材分类（强化搜索引擎与语义理解） */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
              热门影视题材
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link href="/?q=动作" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">动作冒险</Link>
              <Link href="/?q=科幻" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">科幻巨制</Link>
              <Link href="/?q=悬疑" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">悬疑烧脑</Link>
              <Link href="/?q=古装" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">古装传奇</Link>
              <Link href="/?q=喜剧" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">喜剧爆笑</Link>
              <Link href="/?q=言情" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">都市爱情</Link>
              <Link href="/?q=犯罪" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">刑侦犯罪</Link>
              <Link href="/?q=仙侠" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">玄幻仙侠</Link>
              <Link href="/?q=惊悚" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">惊悚恐怖</Link>
              <Link href="/?q=武侠" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">经典武侠</Link>
              <Link href="/?q=国漫" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">热血国漫</Link>
              <Link href="/?q=战争" className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition-colors">历史战争</Link>
            </div>
          </div>

          {/* 客户端与服务生态 */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
              平台与服务
            </h4>
            <nav className="flex flex-col gap-2 text-xs">
              <Link href="/download" className="hover:text-white transition-colors">📱 App 客户端下载</Link>
              <Link href="/faq" className="hover:text-white transition-colors">❓ 常见问题与播放排障</Link>
              <Link href="/about" className="hover:text-white transition-colors">ℹ️ 关于 iKanPP 平台</Link>
              <Link href="/referral" className="hover:text-white transition-colors">🎁 邀请好友畅享特权</Link>
              <Link href="/sitemap.xml" className="hover:text-white transition-colors">🗺️ 网站地图 (Sitemap)</Link>
            </nav>
          </div>
        </div>

        {/* 第三层：GEO 区域覆盖声明（强化地理位置与华人覆盖信任） */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>GEO 全球区域覆盖与极速网络服务节点</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">
            iKanPP 依托 Cloudflare 全球分布式边缘 CDN 配合自建高速持久化镜像，在 <strong className="text-white/60">中国大陆地区</strong>（北京、上海、广州、深圳及各省市网络直连）、<strong className="text-white/60">中国港澳台</strong>、<strong className="text-white/60">东南亚</strong>（新加坡、马来西亚、泰国、越南、印度尼西亚、缅甸）、<strong className="text-white/60">北美</strong>（美国、加拿大）、<strong className="text-white/60">欧洲</strong>（英国、德国、法国）及 <strong className="text-white/60">澳洲</strong>（澳大利亚、新西兰）提供首屏毫秒级响应。
          </p>
        </div>

        {/* 第四层：AI 知识胶囊问答（FAQ Knowledge Capsule，SEO/GEO 友好） */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
            常见问题与 AI 知识胶囊 (FAQ)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <details className="group rounded-lg bg-white/[0.03] border border-white/5 p-3.5 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all hover:bg-white/[0.05]">
              <summary className="flex items-center justify-between text-xs font-medium text-white/80">
                <span>iKanPP 是什么平台？</span>
                <span className="text-white/40 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-[11px] text-white/50 leading-relaxed">
                iKanPP（爱看片片）是面向全球华人的一站式高清影视聚合搜索引擎，多播放源智能调度，覆盖院线电影、热播电视剧、动漫新番与综艺，免翻墙秒开即播。
              </p>
            </details>

            <details className="group rounded-lg bg-white/[0.03] border border-white/5 p-3.5 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all hover:bg-white/[0.05]">
              <summary className="flex items-center justify-between text-xs font-medium text-white/80">
                <span>中国大陆与海外访问是否流畅？</span>
                <span className="text-white/40 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-[11px] text-white/50 leading-relaxed">
                无需翻墙。平台已完成全球及中国大陆网络双轨加速，静态资源就近命中边缘镜像，首屏秒级直出，播放器直连多条高速 CDN 线路，纯净零广告流畅播放。
              </p>
            </details>

            <details className="group rounded-lg bg-white/[0.03] border border-white/5 p-3.5 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all hover:bg-white/[0.05]">
              <summary className="flex items-center justify-between text-xs font-medium text-white/80">
                <span>支持哪些设备与投屏观看？</span>
                <span className="text-white/40 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-[11px] text-white/50 leading-relaxed">
                完美支持。iKanPP 支持主流手机、平板与电脑浏览器自适应，同时提供轻量级 Web App 与客户端，支持投屏至智能电视，随时随地大屏畅享。
              </p>
            </details>
          </div>
        </div>

        {/* 第五层：合规声明、版权保护与服务入口 */}
        <div className="pt-6 border-t border-white/10 space-y-4 text-xs text-white/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[11px] text-white/40 max-w-2xl leading-relaxed">
              免责声明：iKanPP 为纯粹的非营利性流媒体搜索引擎，所有视频资源均来源于公开网络第三方接口或蜘蛛抓取，本站服务器不存储、不制作任何物理视听文件。若权利方认为内容涉及侵权，请联系官方邮箱，我们将在 48 小时内核实并做下架处理。
            </p>
            <div className="flex items-center gap-3 text-[11px]">
              <Link href="/terms" className="hover:text-white transition-colors">服务条款</Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
              <span>·</span>
              <a href="mailto:contact@ikanpp.com" className="hover:text-white transition-colors">版权申诉 (contact@ikanpp.com)</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-white/40">
            <p>© 2024–{currentYear} iKanPP.com · All Rights Reserved.</p>
            <p>全球海外华人影视聚合搜索引擎 · 纯净 4K 秒播</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
