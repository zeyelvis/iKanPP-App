import type { Metadata } from 'next';
import { AdminLayoutClient } from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'iKanPP SEO Mission Control - 管理控制台',
  description: 'iKanPP 全域影视实体与 SEO 自动化促抓监控管理中心',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
