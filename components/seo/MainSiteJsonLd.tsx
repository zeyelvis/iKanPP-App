import React from 'react';

/**
 * 专供主站 www.ikanpp.com 首页的 WebSite + Organization Schema.org 结构化数据
 * 严格与午夜独立站隔离，确保 AI 搜索引擎 (GEO) 与 Google 知识图谱 100% 绿色纯净
 */
export function MainSiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'iKanPP',
            alternateName: ['爱看片片', 'iKanPP 海外华人影视', 'iKanPP Movie'],
            url: 'https://www.ikanpp.com',
            description: '全球海外华人影视聚合搜索引擎 — 多播放源智能聚合，搜遍全网热播电视剧、电影、综艺、动漫',
            inLanguage: ['zh-CN', 'zh-TW', 'zh-HK', 'zh-SG', 'zh-MY', 'en'],
            audience: {
              '@type': 'Audience',
              audienceType: 'Global Chinese Diaspora (海外华人及全球中文用户)',
              geographicArea: ['US', 'CA', 'AU', 'NZ', 'SG', 'MY', 'GB', 'DE', 'FR', 'JP', 'KR', 'HK', 'TW'],
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.ikanpp.com/?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'iKanPP',
            alternateName: '爱看片片',
            url: 'https://www.ikanpp.com',
            logo: 'https://www.ikanpp.com/icon.png',
            sameAs: [],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'zeyelvis@icloud.com',
              contactType: 'customer service',
              availableLanguage: ['Chinese', 'English'],
            },
          },
        ]),
      }}
    />
  );
}
