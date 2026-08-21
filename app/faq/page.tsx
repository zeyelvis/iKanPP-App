import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: '常见问题与帮助中心 (FAQ) - 海外华人追剧免翻墙答疑 | iKanPP 爱看片片',
  description: 'iKanPP 帮助中心汇集海外华人常见问题：如何免翻墙看国内剧、播放源切换、设备多端同步、4K 画质优化与网络故障排除指南。',
  keywords: ['iKanPP帮助', 'iKanPP常见问题', '海外看剧免翻墙', '海外追剧FAQ', '爱看片片帮助', 'iKanPP'],
  openGraph: {
    title: '常见问题与帮助中心 (FAQ) | iKanPP 爱看片片',
    description: '海外华人追剧常见问题与解答 · 免翻墙直连 · 多源播放说明。',
    type: 'website',
    url: 'https://www.ikanpp.com/faq',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/faq',
  },
};

/* ── FAQ 结构化数据 ── */
const faqItems = [
    {
        question: '海外华人如何免费看国内电视剧？',
        answer: 'iKanPP（爱看片片）是专为海外华人打造的免费高清影视聚合搜索平台，支持电影、电视剧、综艺、动漫全类别，无需 VPN，直接访问 ikanpp.com 即可观看。',
    },
    {
        question: 'iKanPP 支持哪些地区？',
        answer: '支持全球所有地区，包括北美、欧洲、澳洲、东南亚等海外华人聚集地区，完全免费，无地区限制。',
    },
    {
        question: '观看是否需要注册账号？',
        answer: '无需注册，直接搜索观看。如需收藏影片和同步观看记录，可使用邮箱快速注册。',
    },
    {
        question: 'iKanPP 和其他影视站有什么区别？',
        answer: 'iKanPP 是影视聚合搜索引擎，不存储任何视频资源，而是通过 AI 技术自动聚合全网多个播放源，智能选择最快线路，保证海外用户流畅观看体验。',
    },
    {
        question: '网站上的影片是否有字幕？',
        answer: '大部分影片自带中文字幕，部分热门剧集提供多语言字幕选项，具体取决于各播放源。',
    },
    {
        question: '支持在手机上观看吗？',
        answer: '完全支持。iKanPP 提供 iOS、Android、macOS 客户端下载，网页端也完美适配手机浏览器。',
    },
    {
        question: '视频卡顿怎么办？',
        answer: '可以尝试切换播放源。iKanPP 支持多源聚合，每个影片通常有 2-5 个播放源可选，系统也会自动推荐延迟最低的线路。',
    },
    {
        question: '如何联系 iKanPP？',
        answer: '可通过邮件 zeyelvis@icloud.com 联系我们，版权投诉会在 48 小时内处理。',
    },
];

// JSON-LD 结构化数据
const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
        },
    })),
};

export default function FAQPage() {
    return (
        <div className="min-h-screen" style={{ color: 'var(--text-color)' }}>
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* 全局头部 */}
            <Navbar variant="home" />

            <main className="max-w-3xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
                {/* 页面标题 */}
                <div className="mb-10">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3 opacity-70"
                       style={{ color: 'var(--accent-color)' }}>
                        FAQ
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2"
                        style={{ color: 'var(--text-color)' }}>
                        常见问题
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                        关于爱看片片，你可能想知道的
                    </p>
                </div>

                {/* FAQ 列表 */}
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <details
                            key={index}
                            className="group rounded-xl transition-all"
                            style={{
                                background: 'var(--glass-bg, rgba(255,255,255,0.04))',
                                border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
                            }}
                        >
                            <summary
                                className="flex items-center justify-between px-5 py-4 cursor-pointer select-none text-sm font-semibold"
                                style={{ color: 'var(--text-color)' }}
                            >
                                <span className="pr-4">{item.question}</span>
                                <svg
                                    className="w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180 opacity-40"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </summary>
                            <div className="px-5 pb-4">
                                <p className="text-sm leading-relaxed"
                                   style={{ color: 'var(--text-color-secondary)', opacity: 0.8 }}>
                                    {item.answer}
                                </p>
                            </div>
                        </details>
                    ))}
                </div>

                {/* 还有问题？ */}
                <div className="mt-12 text-center">
                    <p className="text-sm mb-2" style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                        还有其他问题？
                    </p>
                    <a
                        href="mailto:zeyelvis@icloud.com"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ color: 'var(--accent-color)' }}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M22 4L12 13 2 4" />
                        </svg>
                        联系我们
                    </a>
                </div>
            </main>
        </div>
    );
}
