import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'iKanX - 午夜影视专区 · 4K 极速秒播',
  description: 'iKanX 午夜专区，汇集全网热门影视与独家资源，全场免费无广告高速播放。',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
  alternates: {
    canonical: 'https://ikanx.com/',
  },
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
