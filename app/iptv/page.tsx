import { Metadata } from 'next';
import IPTVClient from './IPTVClient';

export const metadata: Metadata = {
  title: '电视直播 - 央视卫视 & 港澳台地方频道高清在线直播 | iKanPP 爱看片片',
  description: 'iKanPP 电视直播频道支持 CCTV 央视频道全套、各大省级高清卫视、港澳台特色频道与 4K 超清影视轮播。海外免翻墙直连，极速秒切流畅播放。',
  keywords: ['电视直播', 'CCTV直播', '央视直播', '卫视直播', '港澳台电视', '免费IPTV', '海外看电视', 'iKanPP'],
  openGraph: {
    title: '电视直播 - 央视卫视 & 港澳台地方频道 | iKanPP',
    description: '全国电视频道矩阵 · 央视卫视全天候直连 · 港澳台特色频道，4K 超清秒播。',
    type: 'website',
    url: 'https://www.ikanpp.com/iptv',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/iptv',
  },
};

export default function IPTVPage() {
  return <IPTVClient />;
}
