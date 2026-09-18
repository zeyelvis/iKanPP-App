'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  FileText,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: string;
  isPotential: boolean;
  title?: string;
}

interface PageRow {
  page: string;
  title: string;
  entityId: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: string;
  isNeedsCtrOptimization: boolean;
}

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<'queries' | 'pages'>('queries');
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [qRes, pRes] = await Promise.all([
        fetch('/api/admin/analytics/queries'),
        fetch('/api/admin/analytics/pages'),
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        if (qData.success) setQueries(qData.rows || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.success) setPages(pData.rows || []);
      }
    } catch (e) {
      console.error('[Fetch Analytics] 异常:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const filteredQueries = queries.filter((q) =>
    q.query.toLowerCase().includes(search.toLowerCase()) ||
    (q.title && q.title.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.page.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span>Google Search Console 数据分析</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
              GSC Analytics
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            过去 30 天真实搜索流量、第 11~30 位次级冲榜词挖掘与页面点击率 (CTR) 诊断
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>刷新数据</span>
        </button>
      </div>

      {/* 选项卡切换与快速过滤 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 self-start">
          <button
            onClick={() => setTab('queries')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === 'queries'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>核心搜索词潜力分析 ({queries.length})</span>
          </button>

          <button
            onClick={() => setTab('pages')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === 'pages'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>页面曝光与 CTR 诊断 ({pages.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="过滤关键词或片名..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500/50"
          />
        </div>
      </div>

      {/* 视图 1: 搜索词表格 */}
      {tab === 'queries' && (
        <div className="admin-glass-panel rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-medium">
                  <th className="py-3 px-4">搜索关键词 (Query)</th>
                  <th className="py-3 px-4">关联影片</th>
                  <th className="py-3 px-4">Google 平均排名</th>
                  <th className="py-3 px-4">过去30天曝光</th>
                  <th className="py-3 px-4">预估点击量</th>
                  <th className="py-3 px-4">平均点击率 (CTR)</th>
                  <th className="py-3 px-4 text-right">提权状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span>正在加载 GSC 搜索词数据...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      未检索到匹配的搜索词。
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        {row.query}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {row.title ? `《${row.title}》` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-semibold ${
                            row.isPotential ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          第 {row.position} 位
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {row.impressions.toLocaleString()} 次
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {row.clicks} 次
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {row.ctr}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {row.isPotential ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                            <Sparkles className="w-3 h-3" />
                            <span>高潜第2页</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">长尾稳定</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 视图 2: 页面 CTR 诊断表格 */}
      {tab === 'pages' && (
        <div className="admin-glass-panel rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-medium">
                  <th className="py-3 px-4 min-w-[240px]">影视片名与路径</th>
                  <th className="py-3 px-4">平均位置</th>
                  <th className="py-3 px-4">曝光量 (Impressions)</th>
                  <th className="py-3 px-4">点击量 (Clicks)</th>
                  <th className="py-3 px-4">点击率 (CTR)</th>
                  <th className="py-3 px-4">CTR 诊断提示</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span>正在加载页面分析数据...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      未检索到匹配的页面条目。
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{row.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-sm">
                          {row.page}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        第 {row.position} 位
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {row.impressions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {row.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {row.ctr}
                      </td>
                      <td className="py-3 px-4">
                        {row.isNeedsCtrOptimization ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]">
                            <AlertCircle className="w-3 h-3" />
                            <span>曝光高转化低，建议润色描述</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px]">表现良好</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={row.page}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors inline-flex"
                          title="访问详情页"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
