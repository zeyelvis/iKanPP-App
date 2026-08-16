import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* 背景流光 */}
      <div className="absolute w-96 h-96 bg-(--accent-color)/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      {/* 404 标志 */}
      <div className="relative mb-6">
        <span
          className="text-8xl sm:text-9xl font-black tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #E50914 0%, #FF6B6B 50%, #FFA07A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </span>
        <div className="text-4xl absolute -bottom-2 right-0 animate-bounce">🎬</div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
        抱歉，该影视页面未在片库中找到
      </h1>
      <p className="text-sm sm:text-base text-white/50 max-w-md mb-8 leading-relaxed">
        您访问的片源或页面可能已被迁移、下架，或者链接输入有误。
      </p>

      {/* 快捷导航 */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-7 py-3 bg-(--accent-color) hover:brightness-110 active:scale-95 text-white rounded-2xl text-sm font-bold shadow-xl shadow-(--accent-color)/30 transition-all cursor-pointer"
        >
          返回平台首页
        </Link>
        <Link
          href="/movie"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl text-sm font-semibold border border-white/10 transition-all cursor-pointer"
        >
          逛逛电影大厅
        </Link>
        <Link
          href="/ranking"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl text-sm font-semibold border border-white/10 transition-all cursor-pointer"
        >
          查看热门榜单
        </Link>
      </div>
    </div>
  );
}
