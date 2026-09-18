import React from 'react';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/tmdb-slideshow.css";
import "./styles/skeleton.css";
import "./styles/about.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TVProvider } from "@/lib/contexts/TVContext";
import { TVNavigationInitializer } from "@/components/TVNavigationInitializer";

import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ImagePrefetchObserver } from "@/components/common/ImagePrefetchObserver";

import { AdKeywordsInjector } from "@/components/AdKeywordsInjector";
import { BackToTop } from "@/components/ui/BackToTop";
import { ScrollPositionManager } from "@/components/ScrollPositionManager";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";

import { Suspense } from 'react';
import { ReferralCapture } from '@/components/auth/ReferralCapture';
import { JsonLd, generateWebSiteJsonLd } from '@/components/seo/JsonLd';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0A0A0F',
};

// Server Component specifically for reading env/file (async for best practices)
async function AdKeywordsWrapper() {
  let keywords: string[] = [];

  try {
    // 从环境变量读取广告关键词（兼容 Edge Runtime）
    const envKeywords = process.env.AD_KEYWORDS || process.env.NEXT_PUBLIC_AD_KEYWORDS;
    if (envKeywords) {
      keywords = envKeywords.split(/[\n,]/).map((k: string) => k.trim()).filter((k: string) => k);
    }
  } catch (error) {
    console.warn('[AdFilter] Failed to load keywords:', error);
  }

  return <AdKeywordsInjector keywords={keywords} />;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

export const metadata: Metadata = {
  referrer: 'no-referrer',
  title: {
    default: 'iKanPP — 爱看片片 | 海外华人影视聚合搜索与极速播放平台',
    template: `%s`,
  },
  description: 'iKanPP（爱看片片）— 专为全球海外华人打造的影视聚合搜索引擎，多源智能聚合，一键直达全网热播国产剧、美剧、韩剧、日剧、港剧、台剧、动漫新番与院线大片。海外免翻墙直连播放，2026 最新热门电影电视剧全集极速看。',
  authors: [{ name: 'iKanPP' }],

  creator: 'iKanPP',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  metadataBase: new URL(SITE_URL),

  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    title: 'iKanPP — 爱看片片 | 全球海外华人影视聚合搜索平台',
    description: 'iKanPP（爱看片片）— 影视聚合搜索引擎，多播放源聚合，搜遍全网电影电视剧综艺动漫。支持国产剧、美剧、韩剧、日剧、港剧，海外免翻墙直连播放。',
    siteName: 'iKanPP',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'iKanPP - 爱看片片 · 海外华人追剧神器',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iKanPP — 爱看片片 | 海外华人影视聚合播放平台',
    description: 'iKanPP（爱看片片）— 影视聚合搜索引擎，多源秒搜全网电影电视剧综艺动漫，海外直连免翻墙 2026 新片推荐。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <head>
        {/* 🚀 外部与自建图片 CDN 预连接 — 消除 DNS+TLS 延迟，直接提升 LCP */}
        <link rel="preconnect" href="https://img.ikanpp.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.ikanpp.com" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img2.doubanio.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img9.doubanio.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://img2.doubanio.com" />
        <link rel="dns-prefetch" href="https://img9.doubanio.com" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />

        {/* 🔮 全站级 Speculation Rules (推测预渲染与智能预取) — 鼠标触碰/悬停时瞬间在后台预渲染频道大厅与详情页 */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  source: 'list',
                  urls: ['/movie', '/tv', '/anime', '/variety', '/documentary', '/ranking', '/short'],
                  eagerness: 'moderate',
                },
              ],
              prefetch: [
                {
                  source: 'document',
                  where: {
                    and: [
                      {
                        or: [
                          { href_matches: '/title/*' },
                          { href_matches: '/player*' },
                        ],
                      },
                      { not: { href_matches: '/api/*' } },
                      { not: { href_matches: '/premium*' } },
                      { not: { href_matches: '/admin*' } },
                    ],
                  },
                  eagerness: 'moderate',
                },
              ],
            }),
          }}
        />

        {/* Apple PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* Theme Color (for browser address bar) */}
        <meta name="theme-color" content="#000000" />
        {/* Mobile viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-[#0A0A0F] text-white`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <TVProvider>
            <TVNavigationInitializer />
            <AdKeywordsWrapper />
            <Suspense><ReferralCapture /></Suspense>
            {children}
            <Footer />
            <BackToTop />
            <Suspense fallback={null}><ScrollPositionManager /></Suspense>
            <MobileBottomNav />
          </TVProvider>

          <ServiceWorkerRegister />
          <ImagePrefetchObserver />
        </ThemeProvider>

        {/* ARIA Live Region for Screen Reader Announcements */}
        <div
          id="aria-live-announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />




      </body>
    </html>
  );
}
