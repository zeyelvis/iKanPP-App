import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: '关于我们 — 爱看片片的故事 | iKanPP',
  description: '一个海外留学生的假期逆袭：用 AI 技术打造免费、丝滑、懂海外华人的影视聚合搜索引擎。海外免翻墙直连，专注卓越影音体验。',
  keywords: ['关于iKanPP', '爱看片片故事', '海外留学生看剧', '海外华人影视', 'iKanPP'],
  openGraph: {
    title: '关于我们 — 爱看片片的故事 | iKanPP',
    description: '一个海外留学生的假期逆袭：用 AI 技术打造免费、丝滑、懂海外华人的影视聚合搜索平台。',
    type: 'website',
    url: 'https://www.ikanpp.com/about',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/about',
  },
};

/* ── 结构化数据 ── */
const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'iKanPP',
    alternateName: '爱看片片',
    url: 'https://www.ikanpp.com',
    logo: 'https://www.ikanpp.com/icon.png',
    description: '专为海外华人打造的免费高清影视聚合搜索平台，利用 AI 技术智能聚合全网播放源。',
    foundingDate: '2025',
    founder: {
        '@type': 'Person',
        name: '片片',
        description: '海外留学生、独立开发者',
    },
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'zeyelvis@icloud.com',
        contactType: 'customer service',
        availableLanguage: ['Chinese', 'English'],
    },
    sameAs: [],
};

const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: '关于我们 — 爱看片片的故事',
    description: '一个海外留学生的假期逆袭：用AI技术打造免费、丝滑、懂你的影视聚合搜索平台。',
    url: 'https://www.ikanpp.com/about',
    mainEntity: {
        '@type': 'Organization',
        name: 'iKanPP',
        url: 'https://www.ikanpp.com',
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen" style={{ color: 'var(--text-color)' }}>
            {/* JSON-LD 结构化数据 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([organizationSchema, aboutPageSchema]),
                }}
            />

            {/* 全局头部 */}
            <Navbar variant="home" />

            {/* ========== Hero 全屏背景 ========== */}
            <section className="about-hero-wrap">
                <div className="about-hero-bg">
                    <Image
                        src="/images/about-hero.png"
                        alt="深夜宿舍"
                        fill
                        className="object-cover"
                        style={{ objectPosition: 'center 30%' }}
                        priority
                        unoptimized
                    />
                </div>
                <div className="about-hero-overlay" />

                <div className="about-hero-content">
                    <div className="max-w-3xl mx-auto about-reveal">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-5 opacity-80"
                           style={{ color: 'var(--accent-color)' }}>
                            Our Story
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-bold leading-snug mb-4"
                            style={{ color: '#fff' }}>
                            嘿，我是
                            <span style={{
                                background: 'linear-gradient(135deg, var(--accent-color, #f59e0b), #fbbf24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>片片</span>
                        </h1>
                        <p className="text-lg sm:text-xl font-normal leading-relaxed mb-4"
                           style={{ color: 'rgba(255,255,255,0.75)' }}>
                            和你一样，也是个在海外漂泊的留学生。
                        </p>
                        <p className="text-sm leading-relaxed max-w-lg"
                           style={{ color: 'rgba(255,255,255,0.5)' }}>
                            记得刚出国那会儿，最难熬的不是赶不完的 Essay，
                            而是深夜回了家，想看部国产剧下饭……
                        </p>
                    </div>
                </div>
            </section>

            {/* ========== 01 痛点 ========== */}
            <section className="max-w-5xl mx-auto px-6 sm:px-8">
                <div className="about-chapter">
                    {/* 文字侧 */}
                    <div className="about-reveal" style={{ animationDelay: '0.1s' }}>
                        <div className="chapter-num">Chapter 01</div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-5 leading-snug"
                            style={{ color: 'var(--text-color)' }}>
                            为什么会有"爱看片片"？
                        </h2>
                        <p className="text-sm leading-relaxed mb-5"
                           style={{ color: 'var(--text-color-secondary)' }}>
                            结果发现，每次打开那些视频网站：
                        </p>
                        <div className="space-y-2.5">
                            <div className="pain-card">
                                <span className="pain-emoji">💔</span>
                                <div>
                                    <p className="font-semibold text-[13px]" style={{ color: 'var(--text-color)' }}>
                                        "您所在的地区无法播放"
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                                        扎心
                                    </p>
                                </div>
                            </div>
                            <div className="pain-card">
                                <span className="pain-emoji">😤</span>
                                <div>
                                    <p className="font-semibold text-[13px]" style={{ color: 'var(--text-color)' }}>
                                        网页卡成 PPT
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                                        闹心
                                    </p>
                                </div>
                            </div>
                            <div className="pain-card">
                                <span className="pain-emoji">💸</span>
                                <div>
                                    <p className="font-semibold text-[13px]" style={{ color: 'var(--text-color)' }}>
                                        会员费贵得离谱
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                                        心疼钱
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm font-semibold mt-6" style={{ color: 'var(--text-color)' }}>
                            那一刻我觉得，回家的路挺远，看戏的路更远。
                        </p>
                    </div>

                    {/* 图片侧 */}
                    <div className="about-chapter-img about-reveal order-first md:order-last" style={{ animationDelay: '0.2s' }}>
                        <Image
                            src="/images/about-hero.png"
                            alt="深夜宿舍窗前，想家的留学生"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized
                        />
                    </div>
                </div>
            </section>

            <div className="about-divider max-w-5xl mx-auto" />

            {/* ========== 02 假期逆袭 ========== */}
            <section className="max-w-5xl mx-auto px-6 sm:px-8">
                <div className="about-chapter">
                    {/* 图片侧 */}
                    <div className="about-chapter-img about-reveal" style={{ animationDelay: '0.1s' }}>
                        <Image
                            src="/images/about-coding.png"
                            alt="假期宅在屋里写代码的理工男"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized
                        />
                    </div>

                    {/* 文字侧 */}
                    <div className="about-reveal" style={{ animationDelay: '0.2s' }}>
                        <div className="chapter-num">Chapter 02</div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-5 leading-snug"
                            style={{ color: 'var(--text-color)' }}>
                            一个"理工男"的假期逆袭
                        </h2>
                        <div className="space-y-3.5 text-sm leading-relaxed"
                             style={{ color: 'var(--text-color-secondary)' }}>
                            <p>
                                <span className="font-bold text-base" style={{ color: 'var(--text-color)' }}>我不服气。</span>{' '}
                                这个假期，我没去旅游，而是宅在屋里，决定用 AI 技术，
                                给所有的海外小伙伴写一个"解药"。
                            </p>
                            <p>
                                我利用 AI 自动寻找全球最快的视频线路，
                                把散落在互联网角落里的好片子"缝合"在一起，
                                做成了这个{' '}
                                <strong style={{ color: 'var(--accent-color)' }}>
                                    ikanpp.com（爱看片片）
                                </strong>。
                            </p>
                            <p>
                                我不打算收一分钱，因为我知道，大家缺的不是那几块钱，
                                而是一个能随时打开、不卡顿、看得懂的
                                <strong style={{ color: 'var(--text-color)' }}>家乡窗口</strong>。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="about-divider max-w-5xl mx-auto" />

            {/* ========== 03 三个坚持 ========== */}
            <section className="max-w-5xl mx-auto px-6 sm:px-8 py-10 md:py-16">
                <div className="text-center about-reveal" style={{ animationDelay: '0.1s' }}>
                    <div className="chapter-num justify-center">Chapter 03</div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                        我们的三个小坚持
                    </h2>
                    <p className="text-xs mb-8" style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                        每一个承诺，都是片片的真心
                    </p>
                </div>

                <div className="promise-grid about-reveal" style={{ animationDelay: '0.25s' }}>
                    <div className="promise-item">
                        <span className="promise-emoji">🎬</span>
                        <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-color)' }}>
                            真的免费
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-color-secondary)', opacity: 0.7 }}>
                            没有套路，没有乱七八糟的收费，片片请你看片。
                        </p>
                    </div>

                    <div className="promise-item">
                        <span className="promise-emoji">⚡</span>
                        <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-color)' }}>
                            真的丝滑
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-color-secondary)', opacity: 0.7 }}>
                            AI 24小时盯着线路，哪条卡了自动换哪条，海外看球看剧不求人。
                        </p>
                    </div>

                    <div className="promise-item">
                        <span className="promise-emoji">🌍</span>
                        <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-color)' }}>
                            真的懂你
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-color-secondary)', opacity: 0.7 }}>
                            不管是中文老片还是外语新片，片片都在努力用 AI 帮你翻译好、整理好。
                        </p>
                    </div>
                </div>
            </section>

            {/* ========== 💡 真心话 CTA ========== */}
            <section className="max-w-5xl mx-auto px-6 sm:px-8 pb-16">
                <div className="about-cta about-reveal" style={{ animationDelay: '0.1s' }}>
                    <div className="about-cta-bg">
                        <Image
                            src="/images/about-community.png"
                            alt="全球华人社区"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="about-cta-overlay" />

                    <p className="text-xs font-semibold tracking-[0.12em] uppercase mb-3"
                       style={{ color: 'var(--accent-color)' }}>
                        💡 片片的真心话
                    </p>
                    <p className="text-sm leading-relaxed max-w-xl mx-auto mb-5"
                       style={{ color: 'rgba(255,255,255,0.7)' }}>
                        ikanpp.com 叫"爱看片片"，就是想让看片这件事回归它最简单的样子。
                        如果你觉得好用，记得分享给身边那个同样想家的小伙伴。
                    </p>
                    <p className="text-xl sm:text-2xl font-bold mb-6"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-color, #f59e0b), #fbbf24, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        "人在海外，看片自由，从这儿开始。"
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-xl"
                        style={{
                            background: 'var(--accent-color)',
                            boxShadow: '0 0 16px color-mix(in srgb, var(--accent-color, #f59e0b) 35%, transparent)',
                        }}
                    >
                        开始看片 →
                    </Link>
                </div>
            </section>
        </div>
    );
}
