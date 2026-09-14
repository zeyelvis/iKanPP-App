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
            areaServed: ['CN', 'HK', 'TW', 'SG', 'MY', 'US', 'CA', 'AU', 'GB'],
            knowsAbout: [
              '华语电视剧',
              '华语电影',
              '院线新片',
              '动漫新番',
              '热门综艺',
              '纪录片',
              '电视直播',
              '海外华人影视',
              '4K超清画质',
              '零广告播放',
              '智能切源',
              'HLS流媒体',
            ],
            sameAs: [],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'zeyelvis@icloud.com',
              contactType: 'customer service',
              availableLanguage: ['Chinese', 'English'],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'iKanPP 是什么平台？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'iKanPP（爱看片片）是面向全球华人的一站式高清影视聚合搜索引擎，多播放源智能调度，覆盖院线电影、热播电视剧、动漫新番与综艺，免翻墙秒开即播。',
                },
              },
              {
                '@type': 'Question',
                name: '在中国大陆或海外访问 iKanPP 是否需要翻墙？播放速度如何？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '无需翻墙。平台已完成全球及中国大陆网络双轨加速，静态资源就近命中边缘镜像，首屏秒级直出，播放器直连多条高速 CDN 线路，纯净零广告流畅播放。',
                },
              },
              {
                '@type': 'Question',
                name: 'iKanPP 是否支持手机与电视设备？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '完美支持。iKanPP 支持主流手机、平板与电脑浏览器自适应，同时提供轻量级 Web App 与客户端，支持投屏至智能电视，随时随地大屏畅享。',
                },
              },
            ],
          },
        ]),
      }}
    />
  );
}
