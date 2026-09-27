import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Film, ArrowRight, Compass, Star, Clapperboard, Layers } from 'lucide-react';
import { PREBAKED_TOPICS, TopicEntity } from '@/lib/data/prebaked-topics';
import { Navbar } from '@/components/layout/Navbar';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

export const metadata: Metadata = {
  title: '官方深度策展影视专题与高分片单大厅 - iKanPP 爱看片片',
  description:
    'iKanPP 团队特约精选主题片单大厅，汇聚反转悬疑、治愈温情、高智商博弈、硬核科幻等口语化深度策展专题，告别片荒，4K 原生画质免翻墙极速直连。',
  alternates: {
    canonical: `${BASE_URL}/topic`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  openGraph: {
    title: '官方深度策展影视专题与高分片单大厅 - iKanPP 爱看片片',
    description: 'iKanPP 团队特约精选主题片单大厅，汇聚反转悬疑、治愈温情、高智商博弈等深度策展专题。',
    url: `${BASE_URL}/topic`,
    type: 'website',
    siteName: 'iKanPP 爱看片片',
  },
};

export default function TopicsHubPage() {
  const allTopics: TopicEntity[] = Object.values(PREBAKED_TOPICS);
  const currentUrl = `${BASE_URL}/topic`;

  // CollectionPage Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${currentUrl}#collection`,
        name: '官方深度策展影视专题与高分片单大厅',
        description: 'iKanPP 团队特约精选主题片单大厅，汇聚全网优质口语化场景题材影视。',
        url: currentUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: allTopics.map((topic, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: topic.topicTitle,
            url: `${BASE_URL}/topic/${topic.slug}`,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${currentUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '首页',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '专题精选大厅',
            item: currentUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 顶部通栏巨幕氛围 */}
      <div className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/15 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-32 right-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 面包屑导航 */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>/</span>
            <span className="text-white font-medium">专题精选大厅</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5" />
              <span>官方深度策展</span>
            </span>
            <span className="text-xs text-neutral-400">
              共收录 {allTopics.length} 个精选主题 · 覆盖超 100+ 部 4K 高分作品
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 max-w-4xl leading-tight">
            高分口碑片单 · 场景主题大厅
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
            告别无聊与片荒。由 iKanPP 影库研究团队特约撰写深度策展导语，精准击中下饭解压、悬疑烧脑、周末温情等口语化看剧意图。
          </p>
        </div>
      </div>

      {/* 专题网格列表 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {allTopics.map((topic) => {
            const p1 = topic.titles[0]?.cover;
            const p2 = topic.titles[1]?.cover || p1;
            const p3 = topic.titles[2]?.cover || p2;

            return (
              <Link
                key={topic.slug}
                href={`/topic/${topic.slug}`}
                className="group flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#161726]/90 via-[#11121c]/90 to-[#0b0c13]/95 border border-white/10 hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black relative overflow-hidden"
              >
                {/* 背景点缀微光 */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-red-600/20 transition-colors" />

                <div>
                  {/* 顶部标签栏 */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-amber-300 border border-white/10">
                      {topic.intentFamily || '精选主题'}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {topic.titles.length} 部精选作品
                    </span>
                  </div>

                  {/* 专题标题 */}
                  <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-2">
                    {topic.topicTitle}
                  </h2>

                  {/* 深度导语摘录 */}
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                    {topic.curatorNote}
                  </p>
                </div>

                {/* 底部：三连叠层剧照展示与直达按钮 */}
                <div className="pt-2">
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    {/* 左侧：3 张微缩封面叠加 */}
                    <div className="flex items-center -space-x-3 overflow-hidden py-1">
                      {p1 && (
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden border border-white/20 shadow-md">
                          <Image src={p1} alt="" fill sizes="36px" className="object-cover" />
                        </div>
                      )}
                      {p2 && (
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden border border-white/20 shadow-md">
                          <Image src={p2} alt="" fill sizes="36px" className="object-cover" />
                        </div>
                      )}
                      {p3 && (
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden border border-white/20 shadow-md">
                          <Image src={p3} alt="" fill sizes="36px" className="object-cover" />
                        </div>
                      )}
                    </div>

                    {/* 右侧：进入完整片单 */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 group-hover:bg-red-600 text-white font-bold text-xs transition-all duration-300 shadow-sm">
                      <span>探索完整片单</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
