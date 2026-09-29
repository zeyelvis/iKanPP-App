'use client';

import { useState, useEffect } from 'react';
import { isStaleBuildError, reloadForNewBuild } from '@/lib/client/stale-build';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const stale = isStaleBuildError(error);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (stale) reloadForNewBuild();
  }, [stale]);

  const buttonStyle = {
    padding: '10px 24px',
    borderRadius: 999,
    border: 0,
    fontSize: 15,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'opacity 0.2s',
  } as const;

  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0A0A0F',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ padding: 24, maxWidth: 420, width: '100%', boxSizing: 'border-box' }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.3)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              margin: '0 auto 16px',
            }}
          >
            ⚠️
          </div>

          <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
            {stale ? '网站刚更新，正在载入新版本…' : '页面出了点问题'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 24px' }}>
            {stale ? '正在为您获取最新资源' : '页面渲染发生临时异常，点击下方按钮重新加载。'}
          </p>

          {stale ? null : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ ...buttonStyle, background: '#e50914', color: '#fff' }}
              >
                刷新页面
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                style={{
                  ...buttonStyle,
                  background: '#1c1c20',
                  color: 'rgba(255,255,255,.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                返回首页
              </button>
            </div>
          )}

          {process.env.NODE_ENV !== 'production' && !stale && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', padding: 0 }}
              >
                {showDetails ? '隐藏错误堆栈 ▲' : '查看调试日志 ▼'}
              </button>
              {showDetails && (
                <pre
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: 12,
                    fontSize: 10,
                    color: '#fcd34d',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 180,
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
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
