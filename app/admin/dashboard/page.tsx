'use client';

/**
 * 后台仪表盘（2026-10-08 重构阶段 4）：片库数量、入库 Worker 各任务最近一次运行、站点地图、数据集更新时间。
 * 数据来自 D1（/api/admin/dashboard）。
 */
import { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';

interface Dashboard {
  titles: Record<string, number>;
  liveByKind: Record<string, number>;
  createdByIngest: { lastDay: number; lastWeek: number };
  jobs: { job: string; ok: boolean | null; finished: string; report: string[] }[];
  sitemapTitles: number;
  documents: { kind: string; n: number; updated: string }[];
}

const KIND_NAMES: Record<string, string> = { movie: '电影', tv: '电视剧', anime: '动漫', variety: '综艺', documentary: '纪录片', unknown: '未分类' };
const JOB_NAMES: Record<string, string> = {
  hero: '轮播与热播标签',
  latest: '最新上线',
  shorts: '短剧首屏',
  rankings: '四大排序（时间）',
  'rankings-daily': '四大排序（全部）',
  sitemaps: '站点地图',
};
const DOC_NAMES: Record<string, string> = { home: '首页与频道首屏', latest: '最新上线', category: '频道货架', rank: '四大排序' };

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('zh-CN', { hour12: false }) : '-');

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="admin-glass-panel rounded-2xl p-4 border border-white/10">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{typeof value === 'number' ? value.toLocaleString('zh-CN') : value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-emerald-400" />
          仪表盘
        </h1>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="上架作品" value={data.titles.live ?? 0} />
            <Stat label="站点地图收录" value={data.sitemapTitles} />
            <Stat label="近 24 小时新建档" value={data.createdByIngest.lastDay} />
            <Stat label="近 7 天新建档" value={data.createdByIngest.lastWeek} />
          </div>

          <div className="admin-glass-panel rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-semibold text-white mb-3">各频道上架作品</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(data.liveByKind)
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <span key={k} className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300">
                    {KIND_NAMES[k] ?? k} {n.toLocaleString('zh-CN')}
                  </span>
                ))}
              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-500">已合并 {(data.titles.merged ?? 0).toLocaleString('zh-CN')}</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-500">已下架 {(data.titles.removed ?? 0).toLocaleString('zh-CN')}</span>
            </div>
          </div>

          <div className="admin-glass-panel rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-semibold text-white mb-3">入库 Worker 任务（最近一次运行）</h2>
            <div className="space-y-3">
              {data.jobs.map((j) => (
                <div key={j.job} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${j.ok ? 'bg-emerald-400' : j.ok === false ? 'bg-red-400' : 'bg-slate-500'}`} />
                    <span className="text-white">{JOB_NAMES[j.job] ?? j.job}</span>
                    <span className="text-xs text-slate-500">{fmt(j.finished)}</span>
                  </div>
                  <ul className="mt-1 ml-4 text-xs text-slate-400 space-y-0.5">
                    {j.report.slice(0, 8).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-glass-panel rounded-2xl p-4 border border-white/10">
            <h2 className="text-sm font-semibold text-white mb-3">首屏与列表数据集</h2>
            <table className="w-full text-xs">
              <tbody>
                {data.documents.map((d) => (
                  <tr key={d.kind} className="border-b border-white/5 last:border-0">
                    <td className="py-1.5 text-slate-300">{DOC_NAMES[d.kind] ?? d.kind}</td>
                    <td className="py-1.5 text-slate-400">{d.n} 份</td>
                    <td className="py-1.5 text-slate-500 text-right">更新于 {fmt(d.updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
