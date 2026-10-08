'use client';

/**
 * 各国打开速度：真实用户浏览器上报的首字节（TTFB）与最大内容绘制（LCP），存在 Analytics Engine（ikanpp_pagespeed）。
 * 需要 Worker 配置 AE_API_TOKEN 才能查询；没配时接口返回 note 说明。
 */
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Gauge, Globe, RefreshCw, Zap } from 'lucide-react';

interface SpeedRow {
  country: string;
  sampleCount: number;
  ttfbP50: number;
  ttfbP75: number;
  lcpP50: number;
  lcpP75: number;
}

const COUNTRY_NAMES: Record<string, string> = {
  CN: '中国大陆',
  US: '美国',
  HK: '中国香港',
  TW: '中国台湾',
  JP: '日本',
  SG: '新加坡',
  MY: '马来西亚',
  KR: '韩国',
  AU: '澳大利亚',
  CA: '加拿大',
  GB: '英国',
  DE: '德国',
  FR: '法国',
  VN: '越南',
  TH: '泰国',
  PH: '菲律宾',
  ID: '印尼',
  MM: '缅甸',
  RU: '俄罗斯',
};

const DAY_OPTIONS = [1, 7, 30];

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<SpeedRow[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics/speed?days=${days}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `HTTP ${res.status}`);
      setRows(json.rows || []);
      setNote(json.note || '');
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Gauge className="w-6 h-6 text-red-400" />
          各国打开速度
        </h1>
        <div className="flex items-center gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs ${days === d ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            >
              近 {d} 天
            </button>
          ))}
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3">{error}</div>}

      <div className="admin-glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-medium">
                <th className="py-3 px-4">国家 / 地区</th>
                <th className="py-3 px-4">真实样本量</th>
                <th className="py-3 px-4">首字节 TTFB (P50 中位数)</th>
                <th className="py-3 px-4">首字节 TTFB (P75)</th>
                <th className="py-3 px-4">最大内容绘制 LCP (P50)</th>
                <th className="py-3 px-4">最大内容绘制 LCP (P75)</th>
                <th className="py-3 px-4 text-right">网络体验评级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>正在读取各国打开速度...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                    <div className="text-slate-300 font-medium">{note || `暂无近 ${days} 天的网页加载速度样本`}</div>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      真实用户在各国家和地区访问本站时，浏览器将自动上报 TTFB 与 LCP 首帧指标至 Cloudflare Workers Analytics Engine (ikanpp_pagespeed)。
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const countryName = COUNTRY_NAMES[row.country] || '其他地区';
                  const isUltraFast = row.ttfbP50 > 0 && row.ttfbP50 <= 300 && (row.lcpP50 === 0 || row.lcpP50 <= 1500);
                  const isGood = row.ttfbP50 > 0 && row.ttfbP50 <= 800 && (row.lcpP50 === 0 || row.lcpP50 <= 3000);

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-[11px]">
                            {row.country}
                          </span>
                          <span>{countryName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {row.sampleCount.toLocaleString()} 次
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {row.ttfbP50 > 0 ? `${row.ttfbP50} ms` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {row.ttfbP75 > 0 ? `${row.ttfbP75} ms` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {row.lcpP50 > 0 ? `${row.lcpP50} ms` : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {row.lcpP75 > 0 ? `${row.lcpP75} ms` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isUltraFast ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                            <Zap className="w-3 h-3" />
                            <span>极速秒开</span>
                          </span>
                        ) : isGood ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px]">
                            <Globe className="w-3 h-3" />
                            <span>体验良好</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                            <AlertCircle className="w-3 h-3" />
                            <span>建议优化</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
