import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'iKanX - 午夜影视专区 · 4K 极速秒播',
    template: '%s | iKanX',
  },
  description: 'iKanX 专属加密影院，汇集精选影视资源，4K 极速秒播，100% 隐私无痕保障。',
  keywords: ['iKanX', '午夜影视', '4K秒播', '专属加密影院', '私人影院'],
  authors: [{ name: 'iKanX' }],
  creator: 'iKanX',
  alternates: {
    canonical: 'https://ikanx.com',
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://ikanx.com',
    title: 'iKanX - 午夜影视专区 · 4K 极速秒播',
    description: 'iKanX 专属加密影院，100% 隐私无痕保障。',
    siteName: 'iKanX',
  },
  twitter: {
    card: 'summary',
    title: 'iKanX - 午夜影视专区',
    description: 'iKanX 专属加密影院',
  },
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
