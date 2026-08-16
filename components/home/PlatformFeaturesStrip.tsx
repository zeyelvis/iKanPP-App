'use client';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: '⚡',
    title: '毫秒级多源竞速',
    desc: '30+ 全网片源节点并行测速，自动优选最快切片',
  },
  {
    icon: '🎬',
    title: '4K 原画 & 影院氛围',
    desc: '超清流畅播放，支持环境氛围流光与弹幕互动',
  },
  {
    icon: '🌍',
    title: '全球边缘 Anycast',
    desc: 'Cloudflare 全球就近分发，海外华人免翻墙直连',
  },
  {
    icon: '📺',
    title: '多端无缝体验',
    desc: '支持手机/电脑/平板/电视大屏模式与无线投屏',
  },
];

export function PlatformFeaturesStrip() {
  return (
    <div className="my-12 py-6 px-6 sm:px-8 bg-[#0A0A0F]/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((f, idx) => (
          <div key={idx} className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
              {f.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                {f.title}
              </h4>
              <p className="text-xs text-white/50 leading-relaxed mt-1">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
