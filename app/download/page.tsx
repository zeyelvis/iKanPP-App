import { Metadata } from 'next';
import DownloadClient from './DownloadClient';

export const metadata: Metadata = {
  title: '客户端下载 - iOS / Android / macOS / Windows / TV 多端全景覆盖 | iKanPP 爱看片片',
  description: 'iKanPP 官方客户端下载，支持 iPhone/iPad、Android 手机平板、Mac、Windows 电脑与 Android 电视盒子 TV 大屏端。海外免翻墙高速直连，全端观看历史无缝同步。',
  keywords: ['iKanPP下载', '爱看片片App', '影视App下载', 'iOS看剧', 'Android看剧', 'TV电视端看剧', 'Mac看剧', 'iKanPP'],
  openGraph: {
    title: '客户端下载 - iOS / Android / macOS / Windows / TV 多端覆盖 | iKanPP',
    description: '全平台全场景覆盖 · 手机 / 电脑 / 平板 / 电视大屏 · 免翻墙秒播。',
    type: 'website',
    url: 'https://www.ikanpp.com/download',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/download',
  },
};

export default function DownloadPage() {
  return <DownloadClient />;
}
