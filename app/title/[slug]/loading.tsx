import React from 'react';

export default function TitleLoading() {
  return (
    <main className="min-h-screen bg-[#07070a] text-white selection:bg-red-500/30 selection:text-red-200 overflow-x-hidden relative">
      {/* 顶部通栏巨幅暗黑剧照毛玻璃骨架 */}
      <div className="absolute top-0 left-0 right-0 h-[480px] sm:h-[580px] lg:h-[680px] pointer-events-none overflow-hidden opacity-30">
        <div className="w-full h-full bg-gradient-to-b from-white/[0.04] via-white/[0.01] to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/60 to-transparent" />
      </div>

      {/* 顶部导航占位 */}
      <div className="h-16 w-full border-b border-white/[0.06] bg-black/20 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 sm:px-8 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-28 h-7 rounded-lg bg-white/[0.08] animate-pulse" />
          <div className="hidden md:flex items-center gap-4">
            <div className="w-14 h-4 rounded bg-white/[0.05] animate-pulse" />
            <div className="w-14 h-4 rounded bg-white/[0.05] animate-pulse" />
            <div className="w-14 h-4 rounded bg-white/[0.05] animate-pulse" />
          </div>
        </div>
        <div className="w-48 h-8 rounded-full bg-white/[0.06] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* 面包屑导航骨架 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-20 h-8 rounded-xl bg-white/[0.06] animate-pulse" />
          <div className="w-32 h-4 rounded bg-white/[0.05] animate-pulse" />
        </div>

        {/* 核心海报与元数据区骨架 */}
        <div className="flex flex-col md:flex-row gap-7 sm:gap-10 mb-12">
          {/* 左侧：2:3 海报骨架 */}
          <div className="shrink-0 w-44 sm:w-56 md:w-64 lg:w-72 mx-auto md:mx-0">
            <div className="aspect-[2/3] w-full rounded-2xl bg-white/[0.06] border border-white/10 shadow-2xl relative overflow-hidden animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            {/* 立即播放按钮骨架 */}
            <div className="mt-4 h-12 w-full rounded-xl bg-white/[0.08] animate-pulse" />
          </div>

          {/* 右侧：元数据骨架 */}
          <div className="flex-1 min-w-0 flex flex-col justify-start">
            {/* 标签行 */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="w-14 h-6 rounded-full bg-white/[0.07] animate-pulse" />
              <div className="w-16 h-6 rounded-full bg-white/[0.07] animate-pulse" />
              <div className="w-12 h-6 rounded-full bg-white/[0.07] animate-pulse" />
              <div className="w-20 h-6 rounded-full bg-white/[0.07] animate-pulse" />
            </div>

            {/* 影片主标题骨架 */}
            <div className="w-3/4 max-w-lg h-9 sm:h-11 rounded-lg bg-white/[0.09] mb-3 animate-pulse" />
            <div className="w-1/2 max-w-sm h-5 rounded bg-white/[0.05] mb-6 animate-pulse" />

            {/* 评分与简要信息胶囊 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-8 rounded-xl bg-white/[0.06] animate-pulse" />
              <div className="w-20 h-4 rounded bg-white/[0.05] animate-pulse" />
              <div className="w-28 h-4 rounded bg-white/[0.05] animate-pulse" />
            </div>

            {/* 演职员信息条 */}
            <div className="space-y-2 mb-6">
              <div className="w-2/3 h-4 rounded bg-white/[0.05] animate-pulse" />
              <div className="w-4/5 h-4 rounded bg-white/[0.05] animate-pulse" />
            </div>

            {/* 剧情简介骨架 */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
              <div className="w-24 h-5 rounded bg-white/[0.07] mb-3 animate-pulse" />
              <div className="w-full h-4 rounded bg-white/[0.04] animate-pulse" />
              <div className="w-11/12 h-4 rounded bg-white/[0.04] animate-pulse" />
              <div className="w-4/5 h-4 rounded bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        </div>

        {/* 选集控制台骨架 (Episodes Selector) */}
        <div className="mb-14 p-5 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-28 h-6 rounded-lg bg-white/[0.08] animate-pulse" />
              <div className="w-16 h-5 rounded-full bg-white/[0.05] animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-7 rounded-lg bg-white/[0.05] animate-pulse" />
              <div className="w-16 h-7 rounded-lg bg-white/[0.05] animate-pulse" />
            </div>
          </div>
          {/* 集数格子骨架 */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
            {Array.from({ length: 20 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 sm:h-11 rounded-xl bg-white/[0.04] border border-white/[0.05] animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 演职员圆形头像滑轨骨架 */}
        <div className="mb-14">
          <div className="w-32 h-6 rounded-lg bg-white/[0.08] mb-5 animate-pulse" />
          <div className="flex gap-3.5 overflow-x-hidden pb-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="shrink-0 w-36 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3 px-3 animate-pulse"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.08]" />
                <div className="space-y-1">
                  <div className="w-14 h-3.5 rounded bg-white/[0.07]" />
                  <div className="w-8 h-2.5 rounded bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 猜你喜欢 / 推荐影片网格骨架 */}
        <div>
          <div className="w-36 h-6 rounded-lg bg-white/[0.08] mb-5 animate-pulse" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="aspect-[2/3] w-full rounded-xl bg-white/[0.05] border border-white/[0.06] animate-pulse" />
                <div className="w-3/4 h-3.5 rounded bg-white/[0.06] animate-pulse" />
                <div className="w-1/2 h-3 rounded bg-white/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
