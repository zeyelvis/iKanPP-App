'use client';

import { useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
          <div className="w-14 h-14 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            ⚠️
          </div>

          <h1 className="text-xl font-bold text-white mb-2">遇到了一些小意外</h1>
          <p className="text-xs text-white/50 mb-6">
            页面渲染发生临时异常，点击下方按钮重新尝试连接片库。
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={reset}
              className="w-full py-3 bg-(--accent-color) hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              重新加载页面
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              返回首页
            </button>
          </div>

          {/* 开发者调试堆栈折叠 */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 pt-4 border-t border-white/10 text-left">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[11px] text-white/40 hover:text-white/70 flex items-center gap-1 cursor-pointer"
              >
                {showDetails ? '隐藏错误堆栈 ▲' : '查看调试日志 ▼'}
              </button>
              {showDetails && (
                <pre className="mt-2 p-3 bg-black/60 rounded-xl text-[10px] text-amber-300 overflow-x-auto whitespace-pre-wrap max-h-48 border border-white/5">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
