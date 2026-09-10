'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';

const GENRES = [
  { label: '全部', value: '' },
  { label: '逆袭打脸', value: '逆袭' },
  { label: '战神霸气', value: '战神' },
  { label: '豪门总裁', value: '豪门' },
  { label: '穿越年代', value: '年代' },
  { label: '古装权谋', value: '古装' },
  { label: '重生改命', value: '重生' },
  { label: '都市神豪', value: '都市' },
  { label: '甜宠闪婚', value: '甜宠' },
];

const REGIONS = [
  { label: '全部短剧', value: '' },
  { label: '男频爽剧', value: '战神' },
  { label: '女频甜宠', value: '甜宠' },
  { label: '年代传奇', value: '年代' },
  { label: '宫闱权谋', value: '古装' },
];

const YEARS = [
  { label: '全部年份', value: '' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
];

const SHELVES = [
  { title: '⚡ 战神归来 · 逆袭打脸爽剧', icon: '⚡', badge: 'GOD OF WAR', tag: '战神', prebakedOnly: true },
  { title: '💍 豪门恩怨 · 甜宠闪婚霸总', icon: '💍', badge: 'SWEET LOVE', tag: '豪门', prebakedOnly: true },
  { title: '⏳ 穿越重生 · 年代绝地反击', icon: '⏳', badge: 'REBORN', tag: '重生', prebakedOnly: true },
  { title: '👑 古装权谋 · 绝色大女主戏', icon: '👑', badge: 'PALACE', tag: '古装', prebakedOnly: true },
];

export default function ShortClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="brand-spinner" /></div>}>
      <CategoryHub
        categoryTitle="精品短剧"
        categorySubtitle="全网爆款爽剧 · 战神逆袭 · 豪门甜宠 · 穿越重生全集连播"
        doubanType="tv"
        activeNav="short"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="短剧"
        usePrebakedOnly={true}
      />
    </Suspense>
  );
}
