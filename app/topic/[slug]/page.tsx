import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Film, ArrowLeft, Star, Compass, Tag, Play } from 'lucide-react';
import { getTopicBySlug, PREBAKED_TOPICS } from '@/lib/services/topic-service';
import { Navbar } from '@/components/layout/Navbar';

export function generateStaticParams() {
  return Object.keys(PREBAKED_TOPICS).map(slug => ({ slug }));
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    return {
      title: '专题未找到 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  const title = topic.metaTitle || `${topic.topicTitle} - 精选高分影视盘点 | iKanPP`;
  const description = topic.metaDescription || topic.curatorNote.slice(0, 150);
  const canonicalUrl = `${BASE_URL}/topic/${topic.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      siteName: 'iKanPP 爱看片片',
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const currentUrl = `${BASE_URL}/topic/${topic.slug}`;

  // CollectionPage 与 BreadcrumbList Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${currentUrl}#collection`,
        name: topic.topicTitle,
        description: topic.curatorNote,
        url: currentUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: topic.titles.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.title,
            url: `${BASE_URL}${item.href}`,
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
            name: '专题精选',
            item: `${BASE_URL}/topic/${topic.slug}`,
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
        <div className="absolute inset-0 bg-linear-to-b from-red-600/10 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 面包屑导航 */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>/</span>
            <span className="text-neutral-500">口语化专题精选</span>
            <span>/</span>
            <span className="text-white font-medium truncate max-w-xs">{topic.topicTitle}</span>
          </nav>

          {/* 专题主标题 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{topic.intentFamily || '精选专题'}</span>
            </span>
            <span className="text-xs text-neutral-500">
              收录 {topic.titles.length} 部精选作品 · 4K 原生画质
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6 max-w-4xl leading-tight">
            {topic.topicTitle}
          </h1>

          {/* 300字深度策展导语 (消灭 Thin Content) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 max-w-4xl backdrop-blur-md">
            <div className="text-xs font-bold text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>深度策展导语 (CURATOR'S NOTE)</span>
            </div>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              {topic.curatorNote}
            </p>
          </div>

          {/* 自然语言长尾词标签云 */}
          {topic.longTailKeywords && topic.longTailKeywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <Tag className="w-3.5 h-3.5 text-neutral-500" />
              {topic.longTailKeywords.map(kw => (
                <span
                  key={kw}
                  className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 片单卡片矩阵 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <span>🍿</span>
          <span>专题精选片单 (共 {topic.titles.length} 部)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topic.titles.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group block p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black"
            >
              <div className="flex gap-4">
                {/* 封面 */}
                <div className="relative aspect-2/3 w-28 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="112px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                  {item.rate && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
                      ★ {item.rate}
                    </div>
                  )}
                </div>

                {/* 详情与高光看点 */}
                <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center justify-center border border-amber-500/20">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors truncate">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-neutral-400 mb-2">
                      {item.year || '2024'} · {item.type === 'tv' ? '剧集' : '电影'}
                    </p>

                    {item.highlight && (
                      <p className="text-xs text-neutral-300 leading-snug line-clamp-3 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                        “{item.highlight}”
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-amber-400" />
                    <span>立即播放 4K 完整版</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
