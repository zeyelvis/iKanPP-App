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
import { PasswordGate } from "@/components/PasswordGate";

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
  title: {
    default: 'iKanPP — 爱看片片 | 海外华人影视聚合搜索与极速播放平台',
    template: `%s | iKanPP`,
  },
  description: 'iKanPP（爱看片片）— 专为全球海外华人打造的影视聚合搜索引擎，多源智能聚合，一键直达全网热播国产剧、美剧、韩剧、日剧、港剧、台剧、动漫新番与院线大片。海外免翻墙直连播放，2026 最新热门电影电视剧全集极速看。',
  keywords: [
    // 核心定位词
    'iKanPP', '爱看片片', '影视聚合搜索', '影视搜索引擎', '影片搜索', '播放源聚合', '片源聚合', '影视资源索引', '影视内容聚合',
    // 海外华人高频搜索词
    '海外华人看剧', '海外看国内电视剧', '海外看电影网站', '北美看剧', '美国看电视剧', '加拿大华人影视',
    '欧洲看国产剧', '英国看电影', '澳洲华人看剧', '新西兰华人影视', '新马泰华人追剧', '新加坡看剧', '马来西亚看剧',
    '海外追剧神器', '海外看剧免翻墙', '海外直连影视', '海外无限制看国产剧',
    // 电影
    '电影搜索', '院线电影', '高分电影', '新片推荐', '电影全集', '4K高清电影',
    // 电视剧
    '电视剧搜索', '电视剧全集', '热播剧', '国产剧', '美剧', '韩剧', '日剧', '港剧', '台剧', '大结局在线看',
    // 综艺 + 动漫
    '综艺搜索', '热播综艺', '动漫搜索', '国漫', '日漫', '新番',
    // 年份与热词
    '2026新剧', '2026新片', '本周热播', '高评分美剧', '热门剧集',
  ],
  authors: [{ name: 'iKanPP' }],
  creator: 'iKanPP',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
      'zh-TW': '/',
      'zh-HK': '/',
      'zh-SG': '/',
      'zh-MY': '/',
      'en': '/',
      'x-default': '/',
    },
  },
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
        {/* 🚀 外部图片 CDN 预连接 — 消除 DNS+TLS 延迟，直接提升 LCP */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img2.doubanio.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img9.doubanio.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://img2.doubanio.com" />
        <link rel="dns-prefetch" href="https://img9.doubanio.com" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Apple PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="iKanPP" />
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
            <PasswordGate hasAuth={!!(process.env.ADMIN_PASSWORD || process.env.ACCOUNTS || process.env.ACCESS_PASSWORD)}>
              <AdKeywordsWrapper />
              <Suspense><ReferralCapture /></Suspense>
              {children}
              <Footer />
              <BackToTop />
              <ScrollPositionManager />
              <MobileBottomNav />
            </PasswordGate>
          </TVProvider>

          <ServiceWorkerRegister />
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
