import { Metadata } from 'next';
import VarietyClient from './VarietyClient';

export const metadata: Metadata = {
  title: '综艺娱乐 - 热门真人秀 & 爆笑脱口秀音乐竞演在线看 | iKanPP 爱看片片',
  description: 'iKanPP 综艺频道汇聚 2026 最新爆款真人秀、热门脱口秀、音乐竞演现场、日韩高分真人秀与欧美精选综艺。全网聚合超清无广告，随时随地开心追综。',
  keywords: ['综艺', '真人秀', '脱口秀', '音乐综艺', '韩国综艺', '大陆综艺', '免费综艺', 'iKanPP'],
  openGraph: {
    title: '综艺娱乐 - 热门真人秀 & 爆笑脱口秀 | iKanPP',
    description: '爆笑真人秀 · 顶级音乐竞演 · 热门脱口秀 · 慢生活旅行。',
    type: 'website',
    url: 'https://www.ikanpp.com/variety',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/variety',
  },
};

export default function VarietyPage() {
  return <VarietyClient />;
}
