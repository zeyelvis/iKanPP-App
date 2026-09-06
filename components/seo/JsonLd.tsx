import React from 'react';

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Google Schema.org 结构化数据注入组件 (JSON-LD)
 * 用于在 Google 搜索结果中展示金色五角星评分、上映年份、集数、海报等富媒体卡片 (Rich Snippets)
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * 快速构建全站 WebSite + 站内搜索 SearchAction 结构化数据
 */
export function generateWebSiteJsonLd(siteUrl: string = 'https://www.ikanpp.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'iKanPP — 爱看片片',
    alternateName: ['iKanPP', '爱看片片', '爱看影视', 'iKanPP App'],
    url: siteUrl,
    description: '全球海外华人影视聚合搜索与极速播放平台，免翻墙直连全网最新电影、热播国产剧、美剧、韩剧、日漫新番与国创动漫。',
    inLanguage: ['zh-CN', 'zh-TW', 'zh-HK', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 快速构建电影 / 电视剧 / 动漫的结构化数据
 */
export function generateMediaJsonLd(params: {
  title: string;
  type: 'movie' | 'tv' | 'anime';
  url: string;
  image?: string;
  description?: string;
  datePublished?: string;
  ratingValue?: string | number;
  ratingCount?: number;
  actors?: string[];
  director?: string;
  numberOfEpisodes?: number;
}) {
  const isMovie = params.type === 'movie';
  const rating = parseFloat(String(params.ratingValue || '0'));

  const base: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': isMovie ? 'Movie' : 'TVSeries',
    name: params.title,
    url: params.url,
    image: params.image || 'https://www.ikanpp.com/og-image.png',
    description: params.description || `在 iKanPP 免费在线观看《${params.title}》高清完整版。`,
    inLanguage: 'zh-CN',
  };

  if (params.datePublished) {
    base.datePublished = params.datePublished;
  }

  if (rating > 0) {
    base.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      bestRating: '10',
      worstRating: '1',
      ratingCount: params.ratingCount || 1280,
    };
  }

  if (params.director) {
    base.director = {
      '@type': 'Person',
      name: params.director,
    };
  }

  if (params.actors && params.actors.length > 0) {
    base.actor = params.actors.map(name => ({
      '@type': 'Person',
      name,
    }));
  }

  if (!isMovie && params.numberOfEpisodes) {
    base.numberOfEpisodes = params.numberOfEpisodes;
  }

  return base;
}

/**
 * 快速构建面包屑导航结构化数据 (BreadcrumbList)
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
