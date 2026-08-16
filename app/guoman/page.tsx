import { Metadata } from 'next';
import GuomanClient from './GuomanClient';

export const metadata: Metadata = {
  title: '国漫专区 - 东方玄幻修真年番 & 国创动画巅峰在线看 | iKanPP 爱看片片',
  description: 'iKanPP 国创动漫大厅汇聚全网最全热门国漫：凡人修仙传、完美世界、遮天、斗破苍穹、吞噬星空、仙逆、沧元图、大主宰、剑来、诛仙等超高清 4K 蓝光秒播。',
  keywords: ['国漫', '国漫排行榜', '国创动画', '凡人修仙传', '完美世界', '遮天', '斗破苍穹', '吞噬星空', '仙逆', '玄幻修仙', '免费国漫在线看', 'iKanPP'],
  openGraph: {
    title: '国漫专区 - 东方玄幻修真年番 & 国创动画巅峰 | iKanPP',
    description: '东方玄幻修真年番 · 3D 科幻末世巨制 · 唯美国风经典，4K 蓝光画质畅享。',
    type: 'website',
    url: 'https://www.ikanpp.com/guoman',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/guoman',
  },
};

export default function GuomanPage() {
  return <GuomanClient />;
}
