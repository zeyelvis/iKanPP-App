'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Search,
  Zap,
  BarChart3,
  Settings,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Inbox,
  Rocket,
} from 'lucide-react';
import './admin.css';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: '仪表盘总览', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '影视实体管理', href: '/admin/entities', icon: Film },
  { name: '用户求片工单', href: '/admin/demands', icon: Inbox },
  { name: 'SEO 智能监控', href: '/admin/seo', icon: Search },
  { name: '促抓控制台', href: '/admin/indexing', icon: Zap },
  { name: '全域增长中枢', href: '/admin/growth', icon: Rocket, badge: 'HOT' },
  { name: 'GSC 数据分析', href: '/admin/analytics', icon: BarChart3 },
  { name: '系统配置与审计', href: '/admin/system', icon: Settings },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('验证中...');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 异步拉取一次认证身份
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.status === 401 || res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          setAuthError(errData.error || '未通过 Cloudflare Access Zero Trust 认证');
        } else if (res.ok) {
          // 尝试从返回或 cookie/headers 中显示
          setAdminEmail('zeyelvis@gmail.com');
          setAuthError(null);
        }
      } catch (err: any) {
        setAuthError('网络或鉴权检测失败: ' + (err.message || '未知错误'));
      }
    }
    checkAuth();
  }, []);

  // 路由跳转后自动关闭移动端侧边栏
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#07070B] text-slate-100 flex flex-col antialiased">
      {/* 顶部通栏环境高光线 */}
      <div className="h-[2px] w-full bg-linear-to-r from-red-600 via-amber-500 to-red-600" />

      <div className="flex flex-1 overflow-hidden">
        {/* 桌面端与移动端侧边栏 */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0D0D14]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo 区域 */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-red-600 to-amber-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                K
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                  iKanPP <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Admin</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">SEO Mission Control</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto admin-scrollbar">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              控制中心
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-red-600/15 text-red-400 border border-red-500/30 shadow-sm shadow-red-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 底部状态条与前台入口 */}
          <div className="p-3 border-t border-white/10 space-y-2 bg-[#090910]">
            <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-400">Zero Trust 已保护</div>
                <div className="text-xs font-mono text-slate-200 truncate">{adminEmail}</div>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <span>浏览 iKanPP 前台主站</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* 遮罩层 (移动端) */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto admin-scrollbar">
          {/* 顶栏 */}
          <header className="h-16 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>管理中心</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-200 font-semibold">
                  {NAV_ITEMS.find((item) =>
                    item.href === '/admin/dashboard'
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  )?.name || '概览'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloudflare Access 在线</span>
              </div>
            </div>
          </header>

          {/* 异常警告横条 (如果有未授权拦截) */}
          {authError && (
            <div className="m-4 sm:m-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0 animate-ping" />
              <div>
                <div className="font-semibold text-red-100">认证提醒 / 访问受限</div>
                <div className="text-xs text-red-300/80 mt-0.5">{authError}</div>
                <div className="text-xs text-slate-400 mt-2">
                  提示：如在本地开发调试，需确保 `NODE_ENV=development` 或配置了 Access 凭据；生产环境需经过 Cloudflare Zero Trust 邮箱 OTP 验证。
                </div>
              </div>
            </div>
          )}

          {/* 页面主视图 */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
